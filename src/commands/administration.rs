use crate::{prelude::Error, structs, utils, Context};
use poise::serenity_prelude::{self as serenity, Permissions};

async fn executor_is_dev_or_admin(ctx: Context<'_>) -> Result<bool, Error> {
    let _db = &ctx.data().db;
    let member = ctx.author_member().await.unwrap();

    let has_perms = member
        .roles
        .contains(&ctx.data().config.roles.semestermodrole)
        || member.roles.contains(&ctx.data().config.roles.staffrole);

    if has_perms {
        return Ok(true);
    } else if member
        .permissions(&ctx)
        .map_err(Error::Serenity)?
        .contains(Permissions::ADMINISTRATOR)
    {
        return Ok(true);
    } else {
        return Ok(false);
    }
}

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
    guild_only
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
    guild_only
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
    check = "executor_is_dev_or_admin",
    guild_only
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

        sqlx::query("UPDATE user_xp SET user_xp = $1, user_level = $2 WHERE user_id = $3")
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

        sqlx::query("INSERT INTO user_xp (user_id, user_xp, user_level) VALUES ($1, $2, $3)")
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
    guild_only
)]
pub async fn force_post_mensaplan(ctx: Context<'_>) -> Result<(), Error> {
    let _pool = &ctx.data().db;
    let mensaplan_url = &ctx.data().config.mealplan.url;
    let mensaplan_channel = &ctx.data().config.channels.mealplan;
    let _mention_role = &ctx.data().config.roles.mealplannotify;

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

/// Base command for rule specific commands
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "rule",
    name_localized("de", "rule"),
    description_localized("de", "Regel spezifische Befehle"),
    guild_only,
    check = "executor_is_dev_or_admin",
    subcommands("add", "remove", "list", "get", "edit", "post")
)]
pub async fn rule_command(ctx: Context<'_>) -> Result<(), Error> {
    // root command can only be called in a prefix context as discord does not allow root commands to be called directly
    ctx.say("Nett hier, aber waren sie schon mal in Baden-Württemberg?")
        .await
        .map_err(Error::Serenity)?;
    Ok(())
}

/// Add a new rule
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "add",
    name_localized("de", "add"),
    description_localized("de", "Füge eine neue Regel hinzu"),
    guild_only,
    check = "executor_is_dev_or_admin"
)]
pub async fn add(
    ctx: Context<'_>,
    #[description = "Rule number"] number: i64,
    #[description = "Rule text"] text: String,
) -> Result<(), Error> {
    let pool = &ctx.data().db;

    let rule = structs::Rules {
        rule_number: number,
        rule_text: text,
    };

    sqlx::query("INSERT INTO rules (rule_number, rule_text) VALUES ($1, $2)")
        .bind(rule.rule_number)
        .bind(rule.rule_text)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

    ctx.send(|m| {
        m.embed(|e| {
            e.title("Regel hinzugefügt");
            e.description(format!("Regel {} hinzugefügt", rule.rule_number));
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// Remove a rule
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "remove",
    name_localized("de", "remove"),
    description_localized("de", "Entferne eine Regel"),
    guild_only,
    check = "executor_is_dev_or_admin"
)]
pub async fn remove(
    ctx: Context<'_>,
    #[description = "Rule number"] number: i64,
) -> Result<(), Error> {
    let pool = &ctx.data().db;

    sqlx::query("DELETE FROM rules WHERE rule_number = $1")
        .bind(number)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

    ctx.send(|m| {
        m.embed(|e| {
            e.title("Regel entfernt");
            e.description(format!("Regel {} entfernt", number));
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// List all rules
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "list",
    name_localized("de", "list"),
    description_localized("de", "Zeige alle Regeln"),
    guild_only
)]
pub async fn list(ctx: Context<'_>) -> Result<(), Error> {
    let pool = &ctx.data().db;

    let rules = sqlx::query_as::<sqlx::Postgres, structs::Rules>("SELECT * FROM rules")
        .fetch_all(pool)
        .await
        .map_err(Error::Database)?;

    let mut rule_list = String::new();

    for rule in rules {
        rule_list.push_str(&format!("{}: {}\n", rule.rule_number, rule.rule_text));
    }

    ctx.send(|m| {
        m.embed(|e| {
            e.title("Regeln");
            e.description(rule_list);
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// Get a specific rule
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "get",
    name_localized("de", "get"),
    description_localized("de", "Zeige eine bestimmte Regel"),
    guild_only
)]
pub async fn get(
    ctx: Context<'_>,
    #[description = "Rule number"] number: i64,
) -> Result<(), Error> {
    let pool = &ctx.data().db;

    let rule = sqlx::query_as::<sqlx::Postgres, structs::Rules>(
        "SELECT * FROM rules WHERE rule_number = $1",
    )
    .bind(number)
    .fetch_one(pool)
    .await
    .map_err(Error::Database)?;

    ctx.send(|m| {
        m.embed(|e| {
            e.title("Regel");
            e.description(format!("{}: {}", rule.rule_number, rule.rule_text));
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// Edit a rule
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "edit",
    name_localized("de", "edit"),
    description_localized("de", "Bearbeite eine Regel"),
    guild_only,
    check = "executor_is_dev_or_admin"
)]
pub async fn edit(
    ctx: Context<'_>,
    #[description = "Rule number"] number: i64,
    #[description = "Rule text"] text: String,
) -> Result<(), Error> {
    let pool = &ctx.data().db;

    sqlx::query("UPDATE rules SET rule_text = $1 WHERE rule_number = $2")
        .bind(text)
        .bind(number)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

    ctx.send(|m| {
        m.embed(|e| {
            e.title("Regel bearbeitet");
            e.description(format!("Regel {} bearbeitet", number));
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;

    Ok(())
}

/// Post a rules embed in the rules channel
#[poise::command(
    slash_command,
    prefix_command,
    track_edits,
    rename = "post",
    name_localized("de", "post"),
    description_localized("de", "Poste die Regeln"),
    guild_only,
    check = "executor_is_dev_or_admin"
)]
pub async fn post(
    ctx: Context<'_>,
    #[description = "Channel to post in"] 
    #[channel_types("Text")]
    channel: Option<serenity::GuildChannel>
) -> Result<(), Error> {
    let pool = &ctx.data().db;

    let rules = sqlx::query_as::<sqlx::Postgres, structs::Rules>("SELECT * FROM rules")
        .fetch_all(pool)
        .await
        .map_err(Error::Database)?;

    let mut rule_list = String::new();

    for rule in rules {
        rule_list.push_str(&format!("{}: {}\n", rule.rule_number, rule.rule_text));
    }

    let rules_channel = match channel {
        Some(channel) => channel.id,
        None => ctx.data().config.channels.rules
    };

    rules_channel
        .send_message(&ctx, |m| {
            m.embed(|e| {
                e.title("Regeln");
                e.description(rule_list);
                e
            })
        })
        .await
        .map_err(Error::Serenity)?;

    Ok(())
}
