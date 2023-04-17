use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct UserXP {
    pub user_id: i64,
    pub user_xp: f64,
    pub user_level: i32,
}

#[derive(Debug, FromRow)]
pub struct VerifiedUsers {
    pub user_id: i64,
    pub user_email: String,
}

#[derive(Debug, FromRow)]
pub struct VoiceChannels {
    pub channel_id: i64,
    pub owner_id: i64,
    pub deletion_marker: bool,
}

#[derive(Debug, FromRow)]
pub struct Mensaplan {
    pub date: String,
    pub posted: bool,
    pub plan_hash: String,
}

#[derive(Debug, FromRow)]
pub struct Ads {
    pub message_id: i64,
    // SQL Type: TIME DEFAULT CURRENT_TIMESTAMP
    pub posted_at: chrono::NaiveTime,
}

#[derive(Debug, FromRow)]
pub struct Rules {
    pub rule_number: i64,
    pub rule_text: String,
}

#[derive(Debug, FromRow)]
pub struct Semestermods {
    pub user_id: i64,
}

impl Default for UserXP {
    fn default() -> Self {
        Self {
            user_id: 0,
            user_xp: 0.0,
            user_level: 0,
        }
    }
}

#[derive(Debug, FromRow)]
pub struct Rss {
    pub rss_title: String,
    pub message_id: i64,
    pub channel_id: i64,
}
