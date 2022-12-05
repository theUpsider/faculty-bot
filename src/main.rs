use dotenv::dotenv;
use poise::{
    self,
    serenity_prelude::{
        self as serenity,
        GatewayIntents,
    }
};

pub type Error = Box<dyn std::error::Error + Send + Sync>;
pub type Context<'a> = poise::Context<'a, Data, Error>;
pub type ApplicationContext<'a> = poise::ApplicationContext<'a, Data, Error>;


#[derive(Clone)]
pub struct Data {
    pub answer_to_life_the_universe_and_everything: u32,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
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
                prefix: Some(">".to_string()),
                ..Default::default()
            },
            ..Default::default()
        })
        .user_data_setup(move |_ctx, _ready, _framework| {
            Box::pin(async move {
                Ok(Data {
                    answer_to_life_the_universe_and_everything: 42,
                })
            })
        })
        .token(token)
        .intents(GatewayIntents::all())
        
        .build()
        .await?
        .start_autosharded()
        .await?;


    Ok(())
}



#[poise::command(prefix_command)]
async fn register(ctx: Context<'_>) -> Result<(), Error> {
    poise::builtins::register_application_commands_buttons(ctx).await?;
    Ok(())
}

#[poise::command(slash_command, prefix_command)]
async fn age(
    _ctx: Context<'_>,
    #[description = "Selected user"] user: Option<serenity::User>,
) -> Result<(), Error> {
    println!("{:?}", user);
    Ok(())
}