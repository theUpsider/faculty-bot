mod utils;
mod eventhandler;
mod config;

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
    #[non_exhaustive]
    pub enum Error {
        /// Error from the Serenity library, usually Discord related
        Serenity(serenity::Error),
        /// Error returned from sqlite
        Database(sqlx::Error),
        /// Generic error
        Generic(GenericError),
        /// Error returned from IO (Subprocess/File)
        IO(std::io::Error),
        /// Error returned from a network request
        NetRequest(reqwest::Error),
        /// Error with a custom message
        WithMessage(String),
        /// Error from the sqlx migration
        Migration(sqlx::migrate::MigrateError),
        /// Error from the serde_json library
        Serde(serde_json::Error),
        /// Error when parsing goes wrong
        ParseIntError(std::num::ParseIntError),
        /// Idk bruh, don't ask me
        Unknown
    }

    impl std::fmt::Display for Error {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            match self {
                Error::Serenity(e) => write!(f, "Serenity error: {}", e),
                Error::Database(e) => write!(f, "Database error: {}", e),
                Error::Generic(e) => write!(f, "Generic error: {}", e),
                Error::IO(e) => write!(f, "IO error: {}", e),
                Error::NetRequest(e) => write!(f, "NetRequest error: {}", e),
                Error::WithMessage(e) => write!(f, "An error occured: {}", e),
                Error::Migration(e) => write!(f, "Migration error: {}", e),
                Error::Serde(e) => write!(f, "Deserialization error: {}", e),
                Error::ParseIntError(e) => write!(f, "ParseIntError: {}", e),
                _ => write!(f, "Unknown error occured, ask the developers for more information"),
            }
        }
    }
}

pub type Context<'a> = poise::Context<'a, Data, prelude::Error>;
pub type ApplicationContext<'a> = poise::ApplicationContext<'a, Data, prelude::Error>;


#[derive(Clone)]
pub struct Data {
    pub db: sqlx::SqlitePool,
}

#[tokio::main]
async fn main() -> Result<(), prelude::Error> {
    dotenv().ok();

    // read config.json
    let config = config::read_config()?;
    println!("{:?}", config);

    tracing_subscriber::fmt::init();
    tracing::info!("Starting up");

    let token = std::env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    let db_conn = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(
            sqlx::sqlite::SqliteConnectOptions::new()
                .filename("database.db")
                .create_if_missing(true)
        )
        .await.map_err(prelude::Error::Database)?;

        //sqlx::migrate!().run(&db_conn).await.map_err(prelude::Error::Migration)?;

        // run "faculty_manager.sql"

        sqlx::query_file!("migrations/faculty_manager.sql")
            .execute(&db_conn) 
            .await
            .map_err(prelude::Error::Database)?;


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
                    db: db_conn.clone(),
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

