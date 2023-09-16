use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use poise::serenity_prelude as serenity;

use crate::prelude::{self, Error};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerConfig {
    pub prefix: String,
    pub channels: FacultyManagerChannelConfig,
    #[serde(default = "default_color_config")]
    pub colors: FacultyManagerColorConfig,
    pub roles: FacultyManagerRoleConfig,
    pub general: FacultyManagerGeneralConfig,
    pub mealplan: FacultyManagerMealplanConfig,
    pub rss_settings: FacultyManagerRssConfig,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub podcast_settings: Option<FacultyManagerPodcastConfig>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerChannelConfig {
    pub xp: serenity::ChannelId,
    pub rules: serenity::ChannelId,
    pub news: serenity::ChannelId,
    pub logs: serenity::ChannelId,
    pub ads: serenity::ChannelId,
    pub create_channel: String,
    pub mealplan: serenity::ChannelId,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerColorConfig {
    pub blue: String,
    pub lightblue: String,
    pub green: String,
    pub red: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerRoleConfig {
    pub staffrole: serenity::RoleId,
    pub semestermodrole: serenity::RoleId,
    pub verified: serenity::RoleId,
    pub mealplannotify: serenity::RoleId,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerGeneralConfig {
    pub adstimeout: i64,
    pub chars_for_level: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerMealplanConfig {
    pub url: String,
    pub post_mealplan: bool,
    pub post_on_day: chrono::Weekday,
    pub post_at_hour: chrono::NaiveTime,
    pub imgsettings: MealplanImageSettings,
    pub check: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MealplanImageSettings {
    pub density: u16,
    pub quality: u16,
    pub flatten: bool,
    pub width: u16,
    pub height: u16,
}

fn default_color_config() -> FacultyManagerColorConfig {
    FacultyManagerColorConfig {
        blue: "#007bff".to_string(),
        lightblue: "#17a2b8".to_string(),
        green: "#28a745".to_string(),
        red: "#dc3545".to_string(),
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerRssConfig {
    pub post_rss: bool,
    pub rss_check_interval_hours: u64,
    pub rss_check_after_time_hours: u64,
    pub rss_feed_data: HashMap<serenity::ChannelId, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerPodcastConfig {
    pub post_podcast: bool,
    pub podcast_check_interval: u64,
    pub author_image: String,
    pub podcast_url: String,
    pub podcast_channel: serenity::ChannelId,
}

pub fn read_config() -> Result<FacultyManagerConfig, prelude::Error> {
    let config = std::fs::read_to_string("./config.json").map_err(Error::IO)?;
    let config: FacultyManagerConfig = serde_json::from_str(&config).map_err(Error::Serde)?;
    Ok(config)
}
