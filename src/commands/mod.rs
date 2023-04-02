use poise::serenity_prelude::{self as serenity};

use crate::{prelude::Error, Context, Data};

pub mod administration;
pub mod moderation;
pub mod user;

/// Shows a list of all commands
#[poise::command(slash_command, prefix_command)]
pub async fn help(
    ctx: Context<'_>,
    #[description = "The command to get help for"]
    #[autocomplete = "help_autocomplete"]
    command: Option<String>,
) -> Result<(), Error> {
    let config = HelpConfiguration::default();

    match command {
        Some(cmd) => help_single_command(ctx, &cmd, config).await?,
        None => help_all_commands(ctx, config).await?,
    };

    Ok(())
}

async fn help_autocomplete<'a>(ctx: Context<'_>, partial: &'a str) -> Vec<String> {
    let cmds = &ctx.framework().options.commands;
    let locale = ctx.locale().unwrap_or("en-US");

    cmds.iter()
        .filter(move |cmd| {
            let name = cmd.name_localizations.get(locale).unwrap_or(&cmd.name);
            name.starts_with(partial)
        })
        .map(move |cmd| {
            let name = cmd.name_localizations.get(locale).unwrap_or(&cmd.name);
            name.to_string()
        })
        .collect::<Vec<_>>()
}

/// Optional configuration for how the help message from [`help()`] looks
pub struct HelpConfiguration<'a> {
    /// Extra text displayed at the bottom of your message. Can be used for help and tips specific
    /// to your bot
    pub extra_text_at_bottom: &'a str,
    /// Whether to make the response ephemeral if possible. Can be nice to reduce clutter
    pub ephemeral: bool,
    /// Whether to list context menu commands as well
    pub show_context_menu_commands: bool,
}

impl Default for HelpConfiguration<'_> {
    fn default() -> Self {
        Self {
            extra_text_at_bottom: "",
            ephemeral: true,
            show_context_menu_commands: false,
        }
    }
}

/// Code for printing help of a specific command (e.g. `~help my_command`)
async fn help_single_command(
    ctx: crate::Context<'_>,
    command_name: &str,
    _config: HelpConfiguration<'_>,
) -> Result<(), Error> {
    let command = ctx.framework().options().commands.iter().find(|command| {
        if command.name.eq_ignore_ascii_case(command_name) {
            return true;
        }
        if let Some(context_menu_name) = command.context_menu_name {
            if context_menu_name.eq_ignore_ascii_case(command_name) {
                return true;
            }
        }

        false
    });

    let reply = if let Some(command) = command {
        match command.help_text {
            Some(f) => f(),
            None => command
                .description
                .as_deref()
                .unwrap_or("No help available")
                .to_owned(),
        }
    } else {
        format!("No such command `{}`", command_name)
    };

    ctx.send(|b| {
        b.embed(|e| {
            e.title("Help");
            e.description(reply);
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;
    Ok(())
}

/// Code for printing an overview of all commands (e.g. `~help`)
async fn help_all_commands(
    ctx: crate::Context<'_>,
    _config: HelpConfiguration<'_>,
) -> Result<(), Error> {
    let mut categories =
        crate::utils::OrderedMap::<Option<&str>, Vec<&poise::Command<Data, Error>>>::new();
    for cmd in &ctx.framework().options().commands {
        categories
            .get_or_insert_with(cmd.category, Vec::new)
            .push(cmd);
    }

    let mut embed = serenity::CreateEmbed::default();
    embed.title("Help");
    for (_category_name, commands) in categories {
        for command in commands {
            if command.hide_in_help {
                continue;
            }

            let prefix = if command.slash_action.is_some() {
                String::from("/")
            } else if command.prefix_action.is_some() {
                let options = &ctx.framework().options().prefix_options;

                match &options.prefix {
                    Some(fixed_prefix) => fixed_prefix.clone(),
                    None => match options.dynamic_prefix {
                        Some(dynamic_prefix_callback) => {
                            match dynamic_prefix_callback(poise::PartialContext::from(ctx)).await {
                                Ok(Some(dynamic_prefix)) => dynamic_prefix,
                                // `String::new()` defaults to "" which is what we want
                                Err(_) | Ok(None) => String::new(),
                            }
                        }
                        None => String::new(),
                    },
                }
            } else {
                // This is not a prefix or slash command, i.e. probably a context menu only command
                // which we will only show later
                continue;
            };

            let (arg_name, arg_desc, required) = command
                .parameters
                .iter()
                .map(|param| {
                    let name = &param.name;
                    let desc = param.description.as_deref().unwrap_or("No description");
                    let required = param.required;
                    (name, desc, required)
                })
                .fold(
                    (String::new(), String::new(), true),
                    |(mut arg_name, mut arg_desc, mut required), (name, desc, _req)| {
                        if !required {
                            required = false;
                        }
                        if !arg_name.is_empty() {
                            arg_name.push_str(", ");
                        }
                        arg_name.push_str(&name);
                        if !arg_desc.is_empty() {
                            arg_desc.push_str(", ");
                        }
                        arg_desc.push_str(&desc);
                        (arg_name, arg_desc, required)
                    },
                );

            if required {
                embed.field(
                    &format!("{}{} {}", prefix, command.name, arg_name),
                    &format!(
                        "{}\n{}",
                        command.description.as_deref().unwrap_or("No description"),
                        arg_desc
                    ),
                    false,
                );
            } else {
                embed.field(
                    &format!("{}{} [{}]", prefix, command.name, arg_name),
                    &format!(
                        "{}\n{}",
                        command.description.as_deref().unwrap_or("No description"),
                        arg_desc
                    ),
                    false,
                );
            }
        }
    }

    for command in &ctx.framework().options().commands {
        let kind = match command.context_menu_action {
            Some(poise::ContextMenuCommandAction::User(_)) => "user",
            Some(poise::ContextMenuCommandAction::Message(_)) => "message",
            None => continue,
        };
        let name = command.context_menu_name.unwrap_or(&command.name);
        embed.field(name, format!("(Context menu command on {})", kind), false);
    }

    ctx.send(|b| {
        b.embed(|e| {
            e.0 = embed.0;
            e
        })
    })
    .await
    .map_err(Error::Serenity)?;
    Ok(())
}
