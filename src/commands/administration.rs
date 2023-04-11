use crate::{prelude::Error, structs, Context, utils};
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
    ephemeral,
    required_permissions = "MANAGE_GUILD",
    default_member_permissions = "MANAGE_GUILD",
    guild_only,
)]
pub async fn getmail(
    ctx: Context<'_>,
    #[description = "Selected user"] user: serenity::User,
) -> Result<(), Error> {
    let pool = &ctx.data().db;
    let uid = user.id.0 as i64;
    let db_user = sqlx::query_as::<sqlx::Postgres, structs::VerifiedUsers>(
        "SELECT * FROM verified_users WHERE user_id = $1",
    )
    .bind(uid)
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

/// Run a command on the local machine
#[poise::command(
    rename = "run",
    slash_command,
    prefix_command,
    track_edits,
    name_localized("de", "run"),
    description_localized("de", "Führe einen Befehl auf dem Server aus"),
    owners_only,
    guild_only,
)]
pub async fn run_command(
    ctx: Context<'_>,
    #[description = "Command to run"] command: String,
) -> Result<(), Error> {
    ctx.defer_or_broadcast().await.map_err(Error::Serenity)?;

    let output = tokio::process::Command::new("sh")
        .arg("-c")
        .arg(command)
        .output()
        .await
        .map_err(Error::IO)?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    ctx.send(|msg| {
        msg.embed(|embed| {
            embed
                .title("Output")
                .field("Stdout", format!("```\n{}\n```", stdout), false)
                .field("Stderr", format!("```\n{}\n```", stderr), false)
        })
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// Set the XP of a user
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "set-xp",
    name_localized("de", "set-xp"),
    description_localized("de", "Setze die XP eines Nutzers"),
    required_permissions = "MANAGE_GUILD",
    default_member_permissions = "MANAGE_GUILD",
    guild_only,
)]
pub async fn set_xp(
    ctx: Context<'_>,
    #[description = "Selected user"] user: serenity::User,
    #[description = "New XP"] xp: i64,
) -> Result<(), Error> {
    let pool = &ctx.data().db;
    let uid = user.id.0 as i64;
    let db_user = sqlx::query_as::<sqlx::Postgres, structs::UserXP>(
        "SELECT * FROM user_xp WHERE user_id = $1",
    )
    .bind(uid)
    .fetch_optional(pool)
    .await
    .map_err(Error::Database)?;

    if let Some(mut db_usr) = db_user {
        db_usr.user_xp = xp as f64;
        db_usr.user_level = (db_usr.user_xp / 100.0).floor() as i32;

        sqlx::query(
            "UPDATE user_xp SET user_xp = $1, user_level = $2 WHERE user_id = $3",
        )
        .bind(db_usr.user_xp)
        .bind(db_usr.user_level)
        .bind(uid)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

    } else {
        let new_user = structs::UserXP {
            user_id: uid,
            user_xp: xp as f64,
            user_level: (xp as f64 / 100.0).floor() as i32,
        };

        sqlx::query(
            "INSERT INTO user_xp (user_id, user_xp, user_level) VALUES ($1, $2, $3)",
        )
        .bind(new_user.user_id)
        .bind(new_user.user_xp)
        .bind(new_user.user_level)
        .execute(pool)
        .await
        .map_err(Error::Database)?;
    }

    ctx.say(&format!("Set XP of {} to {}", user.tag(), xp))
        .await
        .map_err(Error::Serenity)?;

 

    Ok(())
}


/// Force-Post mensaplan
#[poise::command(
    slash_command,
    prefix_command,
    rename = "force-post-mensaplan",
    name_localized("de", "force-post-mensaplan"),
    description_localized("de", "Erzwinge das Posten des Mensaplan"),
    required_permissions = "MANAGE_GUILD",
    guild_only,
)]
pub async fn force_post_mensaplan(ctx: Context<'_>) -> Result<(), Error> {
    let pool = &ctx.data().db;
    let mensaplan_url = &ctx.data().config.mealplan.url;
    let mensaplan_channel = &ctx.data().config.channels.mealplan;
    let mention_role = &ctx.data().config.roles.mealplannotify;

    let mp_bytestream = utils::fetch_mensaplan(mensaplan_url).await?;
    
    
    let now = chrono::Local::now();

    let today = now.date_naive().format("%Y-%m-%d").to_string();

    let force_post = mensaplan_channel
        .send_message(&ctx, |msg| {
            msg.add_file(serenity::AttachmentType::Bytes {
                data: std::borrow::Cow::Borrowed(&mp_bytestream),
                filename: "mensaplan.png".to_string(),
            })
        })
        .await
        .map_err(Error::Serenity)?;

    force_post.crosspost(&ctx).await.map_err(Error::Serenity)?;

    // Update last posted date
    sqlx::query("INSERT INTO mensaplan (date, posted) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(&today)
            .bind(true)
            .execute(&ctx.data().db)
            .await
            .map_err(Error::Database)?;

    ctx.say(&format!("Mensaplan für {} gepostet", today))
        .await
        .map_err(Error::Serenity)?;

    Ok(())
}