use poise::{
    serenity_prelude::{self as serenity, Permissions},
};

use crate::{
    prelude::Error,
    Context
};


async fn has_mod_or_semestermod(ctx: Context<'_>) -> Result<bool, Error> {
    let db = &ctx.data().db;
    let member = ctx.author_member().await.unwrap();


    let has_perms = sqlx::query("SELECT user_id FROM semestermods WHERE user_id = $1")
        .bind(member.user.id.0 as i64)
        .fetch_optional(db)
        .await
        .map_err(Error::Database)?
        .is_some();

    if has_perms {
        return Ok(true);
    } else if member.permissions(&ctx).map_err(Error::Serenity)?.contains(Permissions::MANAGE_MESSAGES) {
        return Ok(true);
    }
    else {
        return Ok(false);
    }


}


#[poise::command(
    context_menu_command = "Toggle Pin State",
    check = "has_mod_or_semestermod",
    ephemeral,
    guild_only,
)]
pub async fn pin(
    ctx: Context<'_>,
    #[description = "The message to pin"] message: serenity::Message,
) -> Result<(), Error> {
    if message.pinned {
        message.unpin(&ctx.serenity_context()).await.map_err(Error::Serenity)?;
        ctx.say("Unpinned message").await.map_err(Error::Serenity)?; // TODO: Localize
    } else {
        message.pin(&ctx.serenity_context()).await.map_err(Error::Serenity)?;
        ctx.say("Pinned message").await.map_err(Error::Serenity)?; // TODO: Localize
    }

    Ok(())
}

#[poise::command(
    context_menu_command = "Delete Message",
    check = "has_mod_or_semestermod",
    guild_only,
    ephemeral,
)]
pub async fn delete_message(
    ctx: Context<'_>,
    #[description = "The message to delete"] message: serenity::Message,
) -> Result<(), Error> {
    message.delete(&ctx.serenity_context()).await.map_err(Error::Serenity)?;
    ctx.say("Deleted message").await.map_err(Error::Serenity)?; // TODO: Localize

    Ok(())
}


#[poise::command(
    context_menu_command = "Promote to Semestermod",
    required_permissions = "MANAGE_GUILD",
    guild_only,
)]
pub async fn promote_user(
    ctx: Context<'_>,
    #[description = "The user to promote"] user: serenity::User,
) -> Result<(), Error> {
    let db = &ctx.data().db;
    let uid = user.id.0 as i64;

    sqlx::query("INSERT INTO semestermods (user_id) VALUES ($1)")
        .bind(uid)
        .execute(db)
        .await
        .map_err(Error::Database)?;

    ctx.say(
        format!("Promoted {} to semestermod", user.tag())
    ).await.map_err(Error::Serenity)?; // TODO: Localize

    Ok(())
}

#[poise::command(
    context_menu_command = "Demote from Semestermod",
    required_permissions = "MANAGE_GUILD",
    guild_only,
)]
pub async fn demote_user(
    ctx: Context<'_>,
    #[description = "The user to demote"] user: serenity::User,
) -> Result<(), Error> {
    let db = &ctx.data().db;
    let uid = user.id.0 as i64;

    sqlx::query("DELETE FROM semestermods WHERE user_id = $1")
        .bind(uid)
        .execute(db)
        .await
        .map_err(Error::Database)?;

    ctx.say(
        format!("Demoted {} from semestermod", user.tag())
    ).await.map_err(Error::Serenity)?; // TODO: Localize

    Ok(())
}