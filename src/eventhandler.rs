use poise::serenity_prelude::{self as serenity, Mentionable, AttachmentType};
use crate::{
    Data,
    prelude::Error, utils,
};

pub async fn event_listener(
    ctx: &serenity::Context,
    event: &poise::Event<'_>,
    fw: &poise::FrameworkContext<'_, Data, Error>,
    data: &Data,
) -> Result<(), Error> {
    match event {
        poise::Event::Message{ new_message }=> {
            // give xp
            if new_message.author.bot || new_message.content.starts_with(fw.options.prefix_options.prefix.as_ref().unwrap()) {
                return Ok(());
            }
            let msg = new_message.clone();
            let user_id = i64::from(new_message.author.id);
            // get xp from db
            let mut xp = sqlx::query!("SELECT user_xp FROM user_xp WHERE user_id = $1", user_id)
                .fetch_optional(&data.db)
                .await
                .map_err(Error::Database)?
                .map(|row| row.user_xp)
                .unwrap_or(0);

            println!("{}: {}", new_message.author.name, xp);

            // add xp
            let xp_to_add = msg.content.chars().count() as i64 / 200;
            xp += xp_to_add;
            
            // update xp in db 
            sqlx::query!("INSERT INTO user_xp (user_id, user_xp) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET user_xp = $2", user_id, xp)
                .execute(&data.db)
                .await
                .map_err(Error::Database)?;

            new_message
                .channel_id
                .send_message(&ctx, |f| {
                    f.content(format!("You got {} xp; You now have {}", xp_to_add, xp))
                })
                .await
                .map_err(Error::Serenity)?;

            // check if lvl up
            if (xp - xp_to_add) / 100 == xp / 100 {
                return Ok(());
            } else {
                // get lvl from xp
                let lvl = (xp / 100) as u16;
                
                if lvl == 0 {
                    return Ok(());
                }

                let img = utils::show_levelup_image(&new_message.author, lvl).await?;

                new_message
                    .channel_id
                    .send_message(&ctx, |f| {
                        f.content(format!("Congrats {}!. You leveled up to level {}", new_message.author.mention(), lvl))
                        .add_file(AttachmentType::Bytes {
                            data: std::borrow::Cow::Borrowed(&img),
                            filename: "levelup.png".to_string(),
                        })
                    })
                    .await
                    .map_err(Error::Serenity)?;

            }
            

        }
        _ => {}
    }

    Ok(())
}