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
    pub adstimeout: u64,
    pub chars_for_level: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerMealplanConfig {
    pub url: String,
    pub post_mealplan: bool,
    pub post_on_day: chrono::Weekday,
    pub post_at_hour: chrono::NaiveTime,
    pub imgsettings: MealplanImageSettings,
    pub check: u16,
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

pub fn read_config() -> Result<FacultyManagerConfig, prelude::Error> {
    let config = std::fs::read_to_string("config.json").map_err(Error::IO)?;
    let config: FacultyManagerConfig = serde_json::from_str(&config).map_err(Error::Serde)?;
    Ok(config)
}
