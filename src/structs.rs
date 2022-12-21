#[derive(Debug)]
pub struct UserXP {
    pub user_id: i64,
    pub user_xp: f64,
    pub level: i64,
}

impl Default for UserXP {
    fn default() -> Self {
        Self {
            user_id: 0,
            user_xp: 0.0,
            level: 0,
        }
    }
}