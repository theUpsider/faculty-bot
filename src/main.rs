use dotenv::dotenv;

fn main() {
    dotenv().ok();
    let token = std::env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    println!("Hello, world! {}", token);
}