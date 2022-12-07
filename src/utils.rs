use poise::serenity_prelude as serenity;
use tokio::{process::{
    Command,
}, io::{AsyncWriteExt, AsyncReadExt}};

use std::{process::{
    Stdio,
    ChildStdin
}, os};

use crate::prelude::Error;



/// Comverts a pdf file to a png buffer
async fn pdf_to_png(filepath: std::path::PathBuf) -> Result<Vec<u8>, Error> {
    let child = Command::new("convert")
        .arg("-density")
        .arg("300")
        .arg(filepath)
        .arg("-flatten")
        .arg("png:-")
        .output()
        .await.map_err(Error::IO)?
        .stdout;


    Ok(child)
}

/// Fetch newest Mensaplans from the website
pub async fn fetch_mensaplan<'a>(url: &'a str) -> Result<Vec<u8>, Error> {

    println!("Fetching Mensaplan from {}", url);

    // check if mensaplan is already cached
    let tempdir = std::env::temp_dir();
    if tempdir.join("mensaplan.pdf").exists() {
        println!("Mensaplan is already cached");
        let png = pdf_to_png(tempdir.join("mensaplan.pdf")).await?;
        return Ok(png);
    } else {
        // download mensaplan
        println!("Mensaplan is not cached");
        let response = reqwest::get(url).await.map_err(Error::NetRequest)?;
        let tempdir = std::env::temp_dir();
        let mut file = tokio::fs::File::create(tempdir.join("mensaplan.pdf")).await.map_err(Error::IO)?;
        
        file
            .write_all(
                &response.bytes()
                .await.map_err(Error::NetRequest)?
            ).await.map_err(Error::IO)?;
        
        
        let png = pdf_to_png(tempdir.join("mensaplan.pdf")).await?;
        Ok(png)
    }


}


pub async fn show_levelup_image(user: &serenity::User, level: u16) -> Result<Vec<u8>, Error> {
    let mut file = tokio::fs::File::open("images/banner.png").await.map_err(Error::IO)?;
    println!("got image");
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).await.map_err(Error::IO)?;
//convert banner.png -gravity West -pointsize 35 -fill white -draw "text 280,-30 'galaali has reached'" -draw "text 280,45 'LEVEL 187'"  jpeg:-

    let with_text = Command::new("convert")
        .arg("images/banner.png")
        .arg("-font")
        .arg("images/Roboto-Bold.ttf")
        .arg("-gravity")
        .arg("West")
        .arg("-pointsize")
        .arg("35")
        .arg("-fill")
        .arg("white")
        .arg("-draw")
        .arg(format!("text 280,-30 '{} has reached'", user.name))
        .arg("-draw")
        .arg(format!("text 280,45 'LEVEL {}'", level))
        .arg("jpeg:-")
        .output()
        .await;



    if let Ok(with_text) = with_text {
        Ok(with_text.stdout)
    } else {
        Err(
            Error::WithMessage("Could not convert image".into())
        )
    }
    
}