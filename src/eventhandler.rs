use poise::serenity_prelude::{self as serenity, Mentionable, AttachmentType};
use crate::{
    Data,
    Error, utils,
};
use rand::Rng;

pub async fn event_listener(
    ctx: &serenity::Context,
    event: &poise::Event<'_>,
    _framework: &poise::FrameworkContext<'_, Data, Error>,
    _data: &Data,
) -> Result<(), Error> {
    match event {
        poise::Event::Message{ new_message }=> {
            // give xp
            if new_message.author.bot {
                return Ok(());
            }
            let now_xp = rand::thread_rng().gen_range(1 as f64 ..=10 as f64);
            let xp = new_message.content.len() as f64 / 200.;
            let new_xp = xp + now_xp;

            new_message
                .channel_id
                .say(&ctx.http, format!("{} hat {} xp bekommen (Jetzt bei {:.2})", new_message.author.mention(), xp, new_xp))
                .await?;

            let image = &utils::show_levelup_image(&new_message.author, 1).await?;
            
            new_message
                .channel_id
                .send_message(&ctx, |f| {
                    f.content(format!("Congrats, {}", new_message.author.mention()))
                    .add_file(AttachmentType::Bytes {
                        data: std::borrow::Cow::Borrowed(&image),
                        filename: "levelup.png".into()
                    })
                })
                .await?;

        }
        _ => {}
    }

    Ok(())
}