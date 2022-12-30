use poise::{
    serenity_prelude::{self as serenity, GatewayIntents, Permissions},
    Framework,
};

use crate::{
    prelude::Error,
    Context, Data
};

pub mod administration;
pub mod user;
pub mod moderation;


/// Shows a list of all commands
#[poise::command(slash_command, prefix_command)]
pub async fn help(
    ctx: Context<'_>,
    #[description = "The command to get help for"] command: Option<String>,
) -> Result<(), Error> {
    let locale = ctx.locale().unwrap_or("en-US");
    let cmds = &ctx.framework().options.commands;
    let non = String::from("No description provided");


    ctx.send(|msg| {
        msg.embed(|embed| {
            embed.title("Help");
            embed.description("List of commands");



            for cmd in cmds {
                let name = cmd.name_localizations.get(locale).unwrap_or(&cmd.name);
                let desc = cmd.description_localizations.get(locale).unwrap_or(&cmd.description.as_ref().unwrap_or(&non));
                let required_perms = cmd.required_permissions;

                let args = cmd.parameters.iter().map(|p| {
                    let name = p.name_localizations.get(locale).unwrap_or(&p.name);
                    let arg_desc = p.description_localizations.get(locale).unwrap_or(&p.description.as_ref().unwrap_or(&non));
                    format!("`{}`: {}", name, arg_desc)
                }).collect::<Vec<_>>().join("\n");

                embed.field(name, format!("{}\n\n**Required permissions:** {}\n\n**Arguments:**\n{}", desc, required_perms, args), true);
            }

            embed
        })
    }).await.map_err(Error::Serenity)?;


    Ok(())
}