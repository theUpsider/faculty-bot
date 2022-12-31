#![allow(unused_variables, unused_mut, dead_code)]

use crate::{prelude::Error, Data, structs};

use poise::serenity_prelude::{self as serenity, Mentionable};

use tokio::sync::mpsc;

use chrono::{Datelike, Timelike};

use tracing::{
    info,
};

/// Posts the mensa plan for the current week
pub async fn post_mensaplan(ctx: serenity::Context, data: Data) -> Result<(), Error> {
    #![allow(unused_variables, unused_mut)]
    let (tx, mut rx) = mpsc::channel::<()>(1);

    let config = data.config.clone();
    let post_day = config.mealplan.post_on_day;
    let post_time = config.mealplan.post_at_hour;
    let db = data.db.clone();

    let task = tokio::spawn(async move {
        loop {
            let now = chrono::Local::now();
            let weekday = now.weekday();
            let hour = now.hour();

            if weekday == post_day && hour == post_time.hour() {
                let mensa_plan = crate::utils::fetch_mensaplan(&config.mealplan.url)
                    .await
                    .unwrap();
                let today = now.date_naive().format("%Y-%m-%d").to_string();

                let mensaplan_posted =
                    sqlx::query_as::<sqlx::Postgres, structs::Mensaplan>("SELECT * FROM mensaplan WHERE date = $1")
                        .bind(&today)
                        .fetch_optional(&db)
                        .await
                        .map_err(Error::Database)
                        .unwrap()
                        .map(|row| row.posted)
                        .unwrap_or(false);

                if mensaplan_posted {
                    info!("Mensaplan already posted today");
                } else {
                    let mut channel = config.channels.mealplan;

                    let mut msg = channel
                        .send_message(&ctx, |f| {
                            f.content(format!("{}", config.roles.mealplannotify.mention()))
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
                    .execute(&db)
                    .await
                    .map_err(Error::Database);



                }
            } else {
                info!("Not posting mensaplan today");
            }

            println!("Sleeping for 5 minutes");
            tokio::time::sleep(tokio::time::Duration::from_secs((&data.config.mealplan.check * 60).into())).await;
        } 
    })
    .await;

    Ok(())
}
