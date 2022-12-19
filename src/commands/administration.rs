use crate::{prelude::Error, Context};
use poise::serenity_prelude as serenity;

/// Get the e-mail address a user has verified with
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    name_localized("de", "email"),
    description_localized(
        "de",
        "Zeige die E-Mail Adresse, mit der ein Nutzer sich verifiziert hat"
    ),
    required_permissions = "MANAGE_GUILD",
    default_member_permissions = "MANAGE_GUILD",
    ephemeral
)]
pub async fn getmail(
    ctx: Context<'_>,
    #[description = "Selected user"] user: serenity::User,
) -> Result<(), Error> {
    let pool = &ctx.data().db;
    let uid = user.id.0 as i64;
    let db_user = sqlx::query!("SELECT * FROM verified_users WHERE user_id = $1", uid)
        .fetch_optional(pool)
        .await
        .map_err(Error::Database)?;

    if let Some(db_usr) = db_user {
        ctx.say(&format!(
            "{} is verified with {}",
            user.tag(),
            db_usr.user_email
        ))
        .await
        .map_err(Error::Serenity)?;
    } else {
        ctx.say(&format!("{} is not verified", user.tag()))
            .await
            .map_err(Error::Serenity)?;
    }

    Ok(())
}
