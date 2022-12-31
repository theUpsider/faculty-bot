use crate::{prelude::Error, tasks, utils, Data, structs::{self}};
use poise::serenity_prelude::{self as serenity, AttachmentType, Mentionable};
use tracing::{
    info,
};

pub async fn event_listener(
    ctx: &serenity::Context,
    event: &poise::Event<'_>,
    fw: &poise::FrameworkContext<'_, Data, Error>,
    data: &Data,
) -> Result<(), Error> {
    match event {
        poise::Event::Ready { data_about_bot } => {
            info!("Ready! Logged in as {}", data_about_bot.user.name);
            info!(
                "Prefix: {:?}",
                fw.options.prefix_options.prefix.as_ref()
            );
            info!("Mensaplan task started");
            tasks::post_mensaplan(ctx.clone(), data.clone()).await?;
        }

        poise::Event::Message { new_message } => {
            // give xp
            if new_message.author.bot
                || new_message
                    .content
                    .starts_with(fw.options.prefix_options.prefix.as_ref().unwrap())
            {
                return Ok(());
            }
            let msg = new_message.clone();
            let user_id = i64::from(new_message.author.id);


            // get xp from db
            let mut pool = data.db.acquire().await.map_err(Error::Database)?;
            

            let user_data = sqlx::query_as::<sqlx::Postgres, structs::UserXP>("SELECT * FROM user_xp WHERE user_id = $1")
                .bind(user_id)
                .fetch_optional(&mut pool)
                .await
                .map_err(Error::Database)?
                .unwrap_or_default();

            let mut xp = user_data.user_xp;
                

            println!("{}: {}", new_message.author.name, xp);

            // add xp
            let xp_to_add =
                msg.content.chars().count() as f64 / data.config.general.chars_for_level as f64;
            xp += xp_to_add;
            let xp_float = xp as f64;
            // update xp in db
            sqlx::query("INSERT INTO user_xp (user_id, user_xp) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET user_xp = $2")
                .bind(user_id)
                .bind(xp_float)
                .execute(&mut pool)
                .await
                .map_err(Error::Database)?;

            
            println!("{}: {} -> {}", new_message.author.name, xp - xp_to_add, xp);

            // check if lvl up and level is higher than previous
            
            if (xp - xp_to_add) as f64 / 100. == (xp / 100.)  // check if lvl up
                || user_data.user_level  // check that the new level is higher than the current
                    >= (xp / 100.) as i32
                {
                return Ok(());
            } else {
                // get lvl from xp
                let lvl = (xp / 100.) as i32;

                if lvl == 0 {
                    return Ok(());
                }

                // update level in db
                sqlx::query("INSERT INTO user_xp (user_id, user_level) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET user_level = $2")
                    .bind(user_id)
                    .bind(lvl)
                    .execute(&mut pool)
                    .await
                    .map_err(Error::Database)?;

                let img = utils::show_levelup_image(&new_message.author, lvl as u16).await?;

                new_message
                    .channel_id
                    .send_message(&ctx, |f| {
                        f.content(format!(
                            "Congrats {}!. You leveled up to level {}",
                            new_message.author.mention(),
                            lvl
                        ))
                        .add_file(AttachmentType::Bytes {
                            data: std::borrow::Cow::Borrowed(&img),
                            filename: "levelup.png".to_string(),
                        })
                    })
                    .await
                    .map_err(Error::Serenity)?;
            }
        },

        poise::Event::VoiceStateUpdate { old, new } => {
            if let Some(old_chan) = old {
                if old_chan.channel_id == new.channel_id {
                    // user moved in same channel
                    return Ok(());
                }

                // if no one is in the channel anymore, delete it
                let channel = old_chan.channel_id.unwrap_or_default().to_channel(&ctx).await.map_err(Error::Serenity)?;
                if let serenity::Channel::Guild(channel) = channel {
                    if channel.name() == data.config.channels.create_channel {
                        return Ok(()); // don't delete the create channel
                    }
                    if channel.members(&ctx).await.map_err(Error::Serenity)?.is_empty() {
                        channel.delete(&ctx).await.map_err(Error::Serenity)?;
                    }
                }

            }

            let new_channel = new.channel_id.unwrap_or_default().to_channel(&ctx).await.map_err(Error::Serenity)?;
            let new_channel = match new_channel {
                serenity::Channel::Guild(channel) => channel,
                _ => return Ok(()),
            };

            if &new_channel.name() == &data.config.channels.create_channel {

                let category = new_channel.parent_id;

                let cc = new.guild_id.unwrap().create_channel(&ctx, |f| {
                    f.name(format!("🔊 {}'s Channel", new.member.as_ref().unwrap().display_name()))
                        .kind(serenity::ChannelType::Voice)
                        .permissions(vec![serenity::PermissionOverwrite {
                            allow: serenity::Permissions::MANAGE_CHANNELS,
                            deny: serenity::Permissions::empty(),
                            kind: serenity::PermissionOverwriteType::Member(new.member.as_ref().unwrap().user.id),
                        }]);
                        if category.is_some() {
                            f.category(category.unwrap())
                        } else {
                            f
                        }
                })
                .await
                .map_err(Error::Serenity)?;

                new.member
                    .as_ref()
                    .unwrap()
                    .move_to_voice_channel(&ctx, cc)
                    .await
                    .map_err(Error::Serenity)?;
            }
        }
        _ => {}
    }

    Ok(())
}
