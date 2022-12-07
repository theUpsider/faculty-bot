use crate::{
    config::{FacultyManagerConfig, self},
    utils::fetch_mensaplan,
    prelude::Error,
    Data, Context
};

use poise::serenity_prelude as serenity;

use tokio::sync::mpsc::{
    self,
    Sender,
    Receiver,
};

use chrono::{Weekday, Datelike, Timelike};

/// Posts the mensa plan for the current week
pub async fn post_mensaplan(ctx: &serenity::Context, config: FacultyManagerConfig, data: &Data) -> Result<(), Error> {
    let (tx, mut rx) = mpsc::channel::<()>(1);

    let mut post_day = config.mealplan.post_on_day;
    let mut post_time = config.mealplan.post_at_hour;
    let db = data.db.clone();

    let task = tokio::spawn(async move {
        loop {
            let now = chrono::Local::now();
            let weekday = now.weekday();
            let hour = now.hour();

            if weekday == post_day && hour == post_time.hour() {

            }

        }
    }).await;


    Ok(())

}
