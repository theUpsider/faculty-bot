use tokio::{process::{
    Command,
}, io::{AsyncWriteExt, AsyncReadExt}};

use std::{process::{
    Stdio,
    ChildStdin
}, os};

use crate::Error;



/// Comverts a pdf file to a png buffer
async fn pdf_to_png(filepath: std::path::PathBuf) -> Result<Vec<u8>, Error> {
    let child = Command::new("convert")
        .arg("-density")
        .arg("300")
        .arg(filepath)
        .arg("-flatten")
        .arg("png:-")
        .output()
        .await?
        .stdout;


    Ok(child)
}

/// Fetch newest Mensaplans from the website
pub async fn fetch_mensaplan() -> Result<Vec<u8>, Error> {
    let url = "http://www.max-manager.de/daten-extern/augsburg/pdf/wochenplaene/hs-kempten/aktuell.pdf";

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
        let response = reqwest::get(url).await?;
        let tempdir = std::env::temp_dir();
        let mut file = tokio::fs::File::create(tempdir.join("mensaplan.pdf")).await?;
        file.write_all(&response.bytes().await?).await?;
        let png = pdf_to_png(tempdir.join("mensaplan.pdf")).await?;
        Ok(png)
    }


}