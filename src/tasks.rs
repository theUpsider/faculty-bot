#![allow(unused_variables, unused_mut, dead_code)]

use crate::{
    config::FacultyManagerConfig,
    prelude::Error,
    Data
};

use poise::serenity_prelude as serenity;

use tokio::sync::mpsc;

use chrono::{Datelike, Timelike};

/// Posts the mensa plan for the current week
pub async fn post_mensaplan(ctx: &serenity::Context, config: FacultyManagerConfig, data: &Data) -> Result<(), Error> {
    #![allow(unused_variables, unused_mut)]
    let (tx, mut rx) = mpsc::channel::<()>(1);

    let post_day = config.mealplan.post_on_day;
    let post_time = config.mealplan.post_at_hour;
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
