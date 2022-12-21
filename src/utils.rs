use poise::serenity_prelude as serenity;
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    process::Command,
};
use tracing_subscriber::fmt::format;

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
        .await
        .map_err(Error::IO)?
        .stdout;

    Ok(child)
}

/// Fetch newest Mensaplans from the website
pub async fn fetch_mensaplan<'a>(url: &'a str) -> Result<Vec<u8>, Error> {
    println!("Fetching Mensaplan from {}", url); // be careful not to rape the server
        // download mensaplan
        let response = reqwest::get(url).await.map_err(Error::NetRequest)?;
        let tempdir = std::env::temp_dir();
        let mut file = tokio::fs::File::create(tempdir.join("mensaplan.pdf"))
            .await
            .map_err(Error::IO)?;

        file.write_all(&response.bytes().await.map_err(Error::NetRequest)?)
            .await
            .map_err(Error::IO)?;

        let png = pdf_to_png(tempdir.join("mensaplan.pdf")).await?;
        Ok(png)
}

pub async fn show_levelup_image(user: &serenity::User, level: u16) -> Result<Vec<u8>, Error> {
    let mut file = tokio::fs::File::open("images/banner.png")
        .await
        .map_err(Error::IO)?;
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
        Err(Error::WithMessage("Could not convert image".into()))
    }
}


/// Find discord tag in email
pub async fn find_discord_tag(tag: &str) -> imap::error::Result<Option<String>> {
    let domain = env!("SMTP_SERVER");
    let username = env!("MAILUSER");
    let password = env!("MAILPW");
    let tls = native_tls::TlsConnector::builder().build().unwrap();
      // we pass in the domain twice to check that the server's TLS
    // certificate is valid for the domain we're connecting to.
    let client = imap::connect((domain, 993), domain, &tls).unwrap();

    // the client we have here is unauthenticated.
    // to do anything useful with the e-mails, we need to log in
    let mut imap_session = client
        .login(username, password)
        .map_err(|e| e.0)?;

    // we want to fetch the first email in the INBOX mailbox
    imap_session.select("INBOX")?;

    // fetch message containing tag in subject
    let message = imap_session.search(format!(
        "SUBJECT \"{}\"",
        tag
    ))?;



    if message.len() == 0 {
        return Ok(None);
    }

    let message = message.iter().next().unwrap();

    // fetch the email body
    let messages = imap_session
        .fetch(message.to_string(), "RFC822")?;

    let message = if let Some(m) = messages.iter().next() {
        m
    } else {
        return Ok(None);
    };

    let body = message.body().expect("message did not have a body!");
    let body = std::str::from_utf8(body)
        .expect("message was not valid utf-8")
        .to_string();

    // be nice to the server and log out
    imap_session.logout()?;

    Ok(Some(body))
}