mod utils;
mod eventhandler;

use dotenv::dotenv;
use poise::{
    self,
    serenity_prelude::{
        self as serenity,
        GatewayIntents,
    }
};
use sqlx::sqlite::SqlitePoolOptions;

use rand::Rng;

pub mod prelude {
    use super::*;
    type GenericError = Box<dyn std::error::Error + Send + Sync>;

    #[derive(Debug)]
    pub enum Error {
        Serenity(serenity::Error),
        Database(sqlx::Error),
        Generic(GenericError),
        IO(std::io::Error),
        NetRequest(reqwest::Error),
        WithMessage(String),

    }

    impl std::fmt::Display for Error {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            match self {
                Error::Serenity(e) => write!(f, "Serenity error: {}", e),
                Error::Database(e) => write!(f, "Database error: {}", e),
                Error::Generic(e) => write!(f, "Generic error: {}", e),
                Error::IO(e) => write!(f, "IO error: {}", e),
                Error::NetRequest(e) => write!(f, "NetRequest error: {}", e),
                Error::WithMessage(e) => write!(f, "WithMessage error: {}", e),
            }
        }
    }
}

pub type Context<'a> = poise::Context<'a, Data, prelude::Error>;
pub type ApplicationContext<'a> = poise::ApplicationContext<'a, Data, prelude::Error>;


#[derive(Clone)]
pub struct Data {
    pub answer_to_life_the_universe_and_everything: u32,
}

#[tokio::main]
async fn main() -> Result<(), prelude::Error> {
    dotenv().ok();

    tracing_subscriber::fmt::init();
    tracing::info!("Starting up");

    let token = std::env::var("DISCORD_TOKEN").expect("Expected a token in the environment");


    poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![
                register(),
                age(),
            ],
            prefix_options: poise::PrefixFrameworkOptions {
                prefix: Some("..".to_string()),
                ..Default::default()
            },
            event_handler: |ctx, event, framework, data| {
                Box::pin(async move {
                    eventhandler::event_listener(ctx, event, &framework, data).await
                })
            },
            ..Default::default()
        })
        .setup(move |_ctx, _ready, _framework| {
            Box::pin(async move {
                Ok(Data {
                    answer_to_life_the_universe_and_everything: 42,
                })
            })
        })
        .token(token)
        .intents(GatewayIntents::all())
        
        .build()
        .await.map_err(prelude::Error::Serenity)?
        .start_autosharded()
        .await.map_err(prelude::Error::Serenity)?;


    Ok(())
}



#[poise::command(
    prefix_command
)]
async fn register(ctx: Context<'_>) -> Result<(), prelude::Error> {
    poise::builtins::register_application_commands_buttons(ctx).await.map_err(prelude::Error::Serenity)?;
    Ok(())
}

#[poise::command(
    slash_command,
    prefix_command
)]
async fn age(
    ctx: Context<'_>,
    #[description = "Selected user"] user: Option<serenity::User>,
) -> Result<(), prelude::Error> {

    ctx.defer_or_broadcast().await.map_err(prelude::Error::Serenity)?;

    let user = user.as_ref().unwrap_or_else(|| ctx.author());

    let mensaplan = utils::fetch_mensaplan().await?;
    
    ctx.send(|msg| {
        msg.embed(|embed| {
            embed.title("Age");
            embed.description(format!("{}'s account was created <t:{}:R>", user.name, user.id.created_at().timestamp() ));
            embed
        })
        .attachment(serenity::AttachmentType::Bytes { 
            data: std::borrow::Cow::Borrowed(&mensaplan),
            filename: "mensaplan.png".to_string(),
         })
    }).await.map_err(prelude::Error::Serenity)?;

    Ok(())
}

