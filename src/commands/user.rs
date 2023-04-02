use crate::{prelude::Error, structs, Context};
use poise::serenity_prelude as serenity;

/// Verify yourself with your student email address
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    guild_only,
    name_localized("de", "verifizieren"),
    description_localized("de", "Verifiziere dich mit deiner Studierenden E-Mail Adresse")
)]
pub async fn verify(
    ctx: Context<'_>,
    #[description = "Your student email address (must be ending in @stud.hs-kempten.de)"]
    #[description_localized(
        "de",
        "Deine Studierenden E-Mail Adresse (muss mit @stud.hs-kempten.de enden)"
    )]
    #[name_localized("de", "email-adresse")]
    email: String,
) -> Result<(), Error> {
    // check if email is valid
    if !email.ends_with("@stud.hs-kempten.de") {
        return Err(Error::WithMessage("Invalid email address".to_string()));
    }

    let mmail = crate::utils::find_discord_tag(&ctx.author().tag()).await;

    let _mail_found = match mmail {
        Ok(Some(m)) => m,
        Ok(None) => {
            return Err(Error::WithMessage("Could not find a mail containing your discord tag. Please try again. Contact an admin if this error persists.".into()));
        }
        Err(e) => {
            return Err(Error::WithMessage(format!("An error occured while trying to find your mail. Please try again. Contact an admin if this error persists. Error: {}", e)));
        }
    };

    // check if user is already verified
    let pool = &ctx.data().db;
    let user_id = ctx.author().id.0 as i64;

    let user = sqlx::query("SELECT * FROM verified_users WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(Error::Database)?;

    if user.is_some() {
        return Err(Error::WithMessage("You are already verified".to_string()));
    } else {
        sqlx::query("INSERT INTO verified_users (user_id, user_email) VALUES ($1, $2)")
            .bind(user_id)
            .bind(email)
            .execute(pool)
            .await
            .map_err(Error::Database)?;

        ctx.say("You are now verified!")
            .await
            .map_err(Error::Serenity)?;

        // give them the verified role
        let verified_role = ctx.data().config.roles.verified;

        let mem = ctx.author_member().await.unwrap();
        mem.into_owned()
            .add_role(&ctx.serenity_context(), verified_role)
            .await
            .map_err(Error::Serenity)?;
    }

    Ok(())
}

/// Show the Top 10 users by XP
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    name_localized("de", "leaderboard"),
    description_localized("de", "Zeige die besten 10 Nutzer anhand ihrer XP")
)]
pub async fn leaderboard(ctx: Context<'_>) -> Result<(), Error> {
    let pool = &ctx.data().db;
    let users = sqlx::query_as::<sqlx::Postgres, structs::UserXP>(
        "SELECT * FROM user_xp ORDER BY user_xp DESC LIMIT 10",
    )
    .fetch_all(pool)
    .await
    .map_err(Error::Database)?;

    let mut leaderboard = String::new();
    for (i, user) in users.iter().enumerate() {
        let user_discord = serenity::UserId(user.user_id as u64)
            .to_user(&ctx.serenity_context())
            .await
            .map_err(Error::Serenity)?;
        leaderboard.push_str(&format!(
            "{}. {} - {} XP\n",
            i + 1,
            user_discord.tag(),
            user.user_xp
        ));
    }

    ctx.send(|f| {
        f.embed(|e| {
            e.title("Leaderboard");
            e.description(leaderboard);
            e
        });
        f
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// Show your XP
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    name_localized("de", "xp"),
    description_localized("de", "Zeige deine XP")
)]
pub async fn xp(ctx: Context<'_>) -> Result<(), Error> {
    let pool = &ctx.data().db;
    let user_id = ctx.author().id.0 as i64;

    let user = sqlx::query_as::<sqlx::Postgres, structs::UserXP>(
        "SELECT * FROM user_xp WHERE user_id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(Error::Database)?;

    if let Some(user) = user {
        ctx.send(|f| {
            f.embed(|e| {
                e.description(format!(
                    "You have {} xp, that equals to Level {}",
                    user.user_xp, user.user_level
                ))
            });
            f
        })
        .await
        .map_err(Error::Serenity)?;
    } else {
        ctx.send(|f| {
            f.embed(|e| e.description("You have no XP yet"));
            f
        })
        .await
        .map_err(Error::Serenity)?;
    }

    Ok(())
}
