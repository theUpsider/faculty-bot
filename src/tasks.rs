#![allow(unused_variables, unused_mut, dead_code)]

use crate::{config::FacultyManagerMealplanConfig, prelude::Error, structs, Data};

use poise::serenity_prelude::{self as serenity, ChannelId, Mentionable, MessageId};

use rss::Channel;
use tokio::sync::mpsc;

use chrono::{Datelike, Timelike};

use tracing::info;

struct TaskConfig {
    pub notify_role: serenity::RoleId,
    pub post_mealplan: bool,
    pub post_on_day: chrono::Weekday,
    pub post_at: chrono::NaiveTime,
    pub mealplan_settings: FacultyManagerMealplanConfig,
    pub post_channel: serenity::ChannelId,
}

struct TaskConfigRss {
    pub map: std::collections::HashMap<serenity::ChannelId, String>,
    pub clean_regex: regex::Regex,
    pub timeout_hrs: u64,
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

            let mensaplan_posted = sqlx::query_as::<sqlx::Postgres, structs::Mensaplan>(
                "SELECT * FROM mensaplan WHERE date = $1",
            )
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
                    .await
                    .map_err(Error::Serenity);

                if let Ok(msg) = &mut msg {
                    if let Err(e) = msg.crosspost(&ctx).await.map_err(Error::Serenity) {
                        tracing::error!("Failed to crosspost mensaplan: {:?}", e);
                    }
                }

                let sql_res = sqlx::query("INSERT INTO mensaplan (date, posted) VALUES ($1, $2)")
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
        tokio::time::sleep(tokio::time::Duration::from_secs(
            data.config.mealplan.check * 60,
        ))
        .await;
    }
}

pub async fn post_rss(ctx: serenity::Context, data: Data) -> Result<(), Error> {
    let conf = TaskConfigRss {
        map: data.config.rss_settings.rss_feed_data,
        clean_regex: regex::Regex::new(r"\\n(if wk med|all)").unwrap(),
        timeout_hrs: data.config.rss_settings.rss_check_interval_hours,
    };
    let db = data.db.clone();

    loop {
        for (channel_id, feed_url) in conf.map.iter() {
            let channel = fetch_feed(feed_url).await.unwrap();
            let items = channel.items();
            // get latest item
            let latest = items.first().unwrap();

            let title = latest.title().unwrap();
            let link = latest.link().unwrap();
            let description = latest.description().unwrap();
            let date = latest.pub_date().unwrap();
            let date_ = chrono::DateTime::parse_from_rfc2822(date).unwrap();

            tracing::debug!("Posting in channel: {}", channel_id.0);

            let sql_res = sqlx::query_as::<sqlx::Postgres, structs::Rss>(
                "SELECT * FROM posted_rss WHERE rss_title = $1 AND channel_id = $2",
            )
            .bind(&title)
            .bind(channel_id.0 as i64)
            .fetch_optional(&db)
            .await
            .map_err(Error::Database)
            .unwrap();

            if let Some(exists) = sql_res {
                info!("Update to Already posted rss item");
                let curr_chan = channel_id;
                let msg = curr_chan
                    .message(&ctx, exists.message_id as u64)
                    .await
                    .map_err(Error::Serenity)
                    .unwrap();
                let embed = msg.embeds.first().unwrap();

                let this_date = embed
                    .timestamp
                    .as_ref()
                    .unwrap()
                    .parse::<chrono::DateTime<chrono::Utc>>()
                    .unwrap();
                let item_date = date_.with_timezone(&chrono::Utc);

                // compare dates and post update if newer
                if this_date < item_date {
                    let msg_result = channel_id
                        .send_message(&ctx, |f| {
                            f.content(format!(
                                "Der letzte Post im Planungsportal wurde aktualisiert · {}",
                                title
                            ))
                            .embed(|e| {
                                e.title(title)
                                    .url(link)
                                    .description(conf.clean_regex.replace_all(description, ""))
                                    .timestamp(date_.to_rfc3339())
                                    .color(0xb00b69)
                            })
                            .components(|c| {
                                c.create_action_row(|a| {
                                    a.create_button(|b| {
                                        b.label("Open in Browser")
                                            .style(serenity::ButtonStyle::Link)
                                            .url(link)
                                    })
                                })
                            })
                            .reference_message(&msg)
                            
                        })
                        .await
                        .map_err(Error::Serenity);

                    if let Ok(msg) = msg_result {
                        if let Err(why) = sqlx::query(
                            "UPDATE posted_rss SET message_id = $1 WHERE rss_title = $2 AND channel_id = $3",
                        )
                        .bind(msg.id.0 as i64)
                        .bind(&title)
                        .bind(channel_id.0 as i64)
                        .execute(&db)
                        .await
                        .map_err(Error::Database)
                        {
                            tracing::error!("Failed to update rss message id: {:?}", why);
                        }
                    };
                }
            } else {
                // because let-else won't let me not return from this
                // post
                let msg = channel_id
                    .send_message(&ctx, |f| {
                        f.content(format!("Neue Nachricht im Planungsportal · {}", title))
                            .embed(|e| {
                                e.title(title)
                                    .url(link)
                                    .description(conf.clean_regex.replace_all(description, ""))
                                    .timestamp(date_.to_rfc3339())
                                    .color(0xb00b69)
                            })
                            .components(|c| {
                                c.create_action_row(|a| {
                                    a.create_button(|b| {
                                        b.label("Open in Browser")
                                            .style(serenity::ButtonStyle::Link)
                                            .url(link)
                                    })
                                })
                            })
                    })
                    .await
                    .map_err(Error::Serenity);

                // explode 
                if let Ok(msg) = msg {
                    if let Err(why) = sqlx::query(
                        "INSERT INTO posted_rss (rss_title, channel_id, message_id) VALUES ($1, $2, $3)",
                    )
                    .bind(&title)
                    .bind(channel_id.0 as i64)
                    .bind(msg.id.0 as i64)
                    .execute(&db)
                    .await
                    .map_err(Error::Database)
                    {
                        tracing::error!("Failed to insert rss message id: {:?}", why);
                    }
                }
            };
        }

        info!("Sleeping for {} hours", conf.timeout_hrs);
        tokio::time::sleep(tokio::time::Duration::from_secs(conf.timeout_hrs * 60 * 60)).await;
    }
}

async fn fetch_feed(feed: impl Into<String>) -> Result<Channel, Error> {
    let bytestream = reqwest::get(feed.into())
        .await
        .map_err(Error::NetRequest)?
        .bytes()
        .await
        .map_err(Error::NetRequest)?;
    let channel = Channel::read_from(&bytestream[..]).map_err(Error::Rss)?;

    Ok(channel)
}
