#![allow(unused_variables, unused_mut, dead_code)]

use crate::{prelude::Error, Data, structs, config::FacultyManagerMealplanConfig};

use poise::serenity_prelude::{self as serenity, Mentionable, ChannelId};

use rss::Channel;
use tokio::sync::mpsc;

use chrono::{Datelike, Timelike};

use tracing::{
    info,
};

struct TaskConfig {
    pub notify_role: serenity::RoleId,
    pub post_mealplan: bool,
    pub post_on_day: chrono::Weekday,
    pub post_at: chrono::NaiveTime,
    pub mealplan_settings: FacultyManagerMealplanConfig,
    pub post_channel: serenity::ChannelId,
}

struct TaskConfigRss {
    pub channels: Vec<serenity::ChannelId>,
    pub feeds: Vec<String>,
}

/// Posts the mensa plan for the current week
pub async fn post_mensaplan(ctx: serenity::Context, data: Data) -> Result<(), Error> {

    let task_conf = TaskConfig {
        notify_role: data.config.roles.mealplannotify,
        post_mealplan: data.config.mealplan.post_mealplan,
        post_on_day: data.config.mealplan.post_on_day,
        post_at: data.config.mealplan.post_at_hour,
        mealplan_settings: data.config.mealplan.clone(),
        post_channel: data.config.channels.mealplan,
    };
    

        loop {
            let now = chrono::Local::now();
            let weekday = now.weekday();
            let hour = now.hour();

            if weekday == task_conf.post_on_day && hour == task_conf.post_at.hour() {
                let mensa_plan = crate::utils::fetch_mensaplan(&task_conf.mealplan_settings.url)
                    .await
                    .unwrap();
                let today = now.date_naive().format("%Y-%m-%d").to_string();

                let mensaplan_posted =
                    sqlx::query_as::<sqlx::Postgres, structs::Mensaplan>("SELECT * FROM mensaplan WHERE date = $1")
                        .bind(&today)
                        .fetch_optional(&data.db)
                        .await
                        .map_err(Error::Database)
                        .unwrap()
                        .map(|row| row.posted)
                        .unwrap_or(false);

                if mensaplan_posted {
                    info!("Mensaplan already posted today");
                } else {
                    let mut channel = task_conf.post_channel;

                    let mut msg = channel
                        .send_message(&ctx, |f| {
                            f.content(format!("{}", task_conf.notify_role.mention()))
                                .add_file(serenity::AttachmentType::Bytes {
                                    data: std::borrow::Cow::Borrowed(&mensa_plan),
                                    filename: "mensaplan.png".to_string(),
                                })
                        })
                        .await.map_err(Error::Serenity);

                    if let Ok(msg) = &mut msg {
                        if let Err(e) = msg.crosspost(&ctx).await.map_err(Error::Serenity) {
                            tracing::error!("Failed to crosspost mensaplan: {:?}", e);
                        }

                    }


                    let sql_res = sqlx::query(
                        "INSERT INTO mensaplan (date, posted) VALUES ($1, $2)"
                    )
                    .bind(&today)
                    .bind(true)
                    .execute(&data.db)
                    .await
                    .map_err(Error::Database);



                }
            } else {
                info!("Not posting mensaplan today");
            }

            info!("Sleeping for 5 minutes");
            tokio::time::sleep(tokio::time::Duration::from_secs(data.config.mealplan.check * 60)).await;
        } 


}

pub async fn post_rss(ctx: serenity::Context, data: Data) -> Result<(), Error> {
    let conf = TaskConfigRss {
        channels: data.config.rss_settings.rss_channels,
        feeds: data.config.rss_settings.rss_urls
    };
    let db = data.db.clone();
    let feeds = fetch_feeds(conf.feeds).await.unwrap();


        loop {

            for feed in feeds.iter() {
                let channel = feed.title();
                let items = feed.items();
                // get latest item
                let latest = items.first().unwrap();

                    let title = latest.title().unwrap();
                    let link = latest.link().unwrap();
                    let description = latest.description().unwrap();
                    let date = latest.pub_date().unwrap();
                    let date_ = chrono::DateTime::parse_from_rfc2822(date).unwrap();

                    let sql_res = sqlx::query_as::<sqlx::Postgres, structs::Rss>("SELECT * FROM posted_rss WHERE rss_title = $1")
                        .bind(&title)
                        .fetch_optional(&db)
                        .await
                        .map_err(Error::Database)
                        .unwrap();

                    if let Some(_) = sql_res {} else { // because let-else won't let me not return from this
                        // post
                        let msg = ChannelId::from(1070021986849390623).send_message(&ctx, |f| {
                            f.content(format!("{}: {}", channel, title))
                                .embed(|e| {
                                    e.title(title)
                                        .url(link)
                                        .description(description)
                                        .timestamp(date_.to_rfc3339())
                                        .color(0xb00b69)
                                })
                        }).await.map_err(Error::Serenity).unwrap();

                        let sql_res = sqlx::query(
                            "INSERT INTO posted_rss (rss_title, message_id) VALUES ($1, $2)"
                        )
                        .bind(&title)
                        .bind(msg.id.0 as i64)
                        .execute(&db)
                        .await
                        .map_err(Error::Database).unwrap();

                    };
                    
            }

            info!("Sleeping for 5 minutes");
            tokio::time::sleep(tokio::time::Duration::from_secs(5 * 60)).await;
        } 

}

async fn fetch_feeds(feeds: Vec<impl Into<String>>) -> Result<Vec<Channel>, Error> {
    let mut channels = Vec::new();

    for feed in feeds {
        let bytestream = reqwest::get(feed.into())
            .await
            .map_err(Error::NetRequest)?
            .bytes()
            .await
            .map_err(Error::NetRequest)?;
        let channel = Channel::read_from(&bytestream[..]).map_err(Error::Rss)?;
        channels.push(channel);
    }


    Ok(channels)
}