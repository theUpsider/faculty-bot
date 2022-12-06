use serde::{
    Deserialize,
    Serialize,
};

use poise::serenity_prelude as serenity;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerConfig {
    pub channels: FacultyManagerChannelConfig,
    #[serde(default = "default_color_config")]
    pub colors: FacultyManagerColorConfig,
    pub roles: FacultyManagerRoleConfig,
    pub general: FacultyManagerGeneralConfig,
    pub mealplan: FacultyManagerMealplanConfig,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerChannelConfig {
    pub xp: serenity::ChannelId,
    pub rules: serenity::ChannelId,
    pub news: serenity::ChannelId,
    pub logs: serenity::ChannelId,
    pub ads: serenity::ChannelId,
    pub create_channel: serenity::ChannelId,
    pub mealplan: serenity::ChannelId,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerColorConfig {
    pub blue: serenity::Color,
    pub lightblue: serenity::Color,
    pub green: serenity::Color,
    pub red: serenity::Color,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerRoleConfig {
    pub staffrole: serenity::RoleId,
    pub semestermodrole: serenity::RoleId,
    pub verified: serenity::RoleId,
    pub mealplannotify: serenity::RoleId,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerGeneralConfig {
    pub adstimeout: u64,
    pub chars_for_level: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacultyManagerMealplanConfig {
    pub url: String,
    pub pdf_path: String,
    pub check: bool,
    pub post_on_day: WeekDay,
    pub post_at_hour: u16,
    pub imgsettings: MealplanImageSettings,
}

#[derive(Debug, Serialize, Deserialize)]
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
        blue: serenity::Color::from_rgb(0, 0, 255),
        lightblue: serenity::Color::from_rgb(0, 255, 255),
        green: serenity::Color::from_rgb(0, 255, 0),
        red: serenity::Color::from_rgb(255, 0, 0),
    }
}


#[derive(Debug, Serialize, Deserialize)]
pub enum WeekDay {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}