use crate::{
    prelude::Error,
    Context
};
use poise::serenity_prelude as serenity;

/// Verify yourself with your student email address
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    name_localized("de", "verifizieren"),
    description_localized("de", "Verifiziere dich mit deiner Studierenden E-Mail Adresse")
)]
pub async fn verify(
    ctx: Context<'_>,
    #[description = "Your student email address (must be ending in @stud.hs-kempten.de)"]
    #[description_localized("de", "Deine Studierenden E-Mail Adresse (muss mit @stud.hs-kempten.de enden)")] 
    #[name_localized("de", "email-adresse")]
    email: String,
) -> Result<(), Error> {
    // check if email is valid, we will send a code to this email and verify its authenticity
    if !email.ends_with("@stud.hs-kempten.de") {
        return Err(Error::WithMessage("Invalid email address".to_string()));
    }

    // check if user is already verified
    let pool = &ctx.data().db;  
    let user_id = ctx.author().id.0 as i64;

    let user = sqlx::query!("SELECT * FROM verified_users WHERE user_id = $1", user_id)
        .fetch_optional(pool)
        .await
        .map_err(Error::Database)?;

    if user.is_some() {
        return Err(Error::WithMessage("You are already verified".to_string()));
    }


    Ok(())
}


/// Show Leaderboard
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    name_localized("de", "leaderboard"),
    description_localized("de", "Zeige das Leaderboard")
)]
pub async fn leaderboard(
    ctx: Context<'_>,
) -> Result<(), Error> {
    let pool = &ctx.data().db;  
    let users = sqlx::query!("SELECT user_id, user_xp FROM user_xp ORDER BY user_xp DESC LIMIT 10")
        .fetch_all(pool)
        .await
        .map_err(Error::Database)?;

    let mut leaderboard = String::new();
    for (i, user) in users.iter().enumerate() {
        if let Some(uid) = user.user_id {
            let usr = serenity::UserId(uid as u64).to_user(&ctx).await.map_err(Error::Serenity)?;
            leaderboard.push_str(&format!("{}. {} - {}\n", i + 1, usr.tag(), user.user_xp.unwrap_or(0) ));
        }
    }

    ctx.send(|f| {
        f.embed(|e| {
            e.title("Leaderboard");
            e.description(leaderboard);
            e
        });
        f
    }).await
    .map_err(Error::Serenity)?;

    Ok(())
}