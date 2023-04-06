#  Faculty Manager Setup Guide

## Docker (Very Easy)

- Create a `.env` file in the project root & Fill it like the provided `.env.example`
- Create a `docker-compose.yml` file and fill it like the following
- (Alternatively) Clone the repo, so all files are in the right path

```yml
version: "3"
services:
    bot:
        container_name: faculty_manager
        # you can also use `build: .` here if you wish to build it yourself instead of using the GH Actions Version
        image: ghcr.io/rndrmu/facultymanager:rust-rewrite
        volumes:
          - './config.json:/config.json:ro'
          - './images:/images'
          - './migrations:/migrations'
        environment:
            DISCORD_TOKEN: "${DISCORD_TOKEN}"
            DATABASE_URL: "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${POSTGRES_DB}"
            PREFIX: "${PREFIX}"
            MAILUSER: "${MAILUSER}"
            MAILPW: "${MAILPW}"
            SMTP_SERVER: "${SMTP_SERVER}"
            SMTP_PORT: "${SMTP_PORT}"
            RUST_LOG: "${RUST_LOG}"
        depends_on: [database]
        networks:
            - bot
    database:
        container_name: database
        image: postgres:13
        ports: [5432:5432]
        environment: 
            POSTGRES_USER: ${POSTGRES_USER}
            POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
        volumes:
          - ./migrations/faculty_manager.sql:/docker-entrypoint-initdb.d/init.sql
        networks:
            - bot
    
networks: 
    bot: {}
  ```

  Where `migrations`, `images` and `config.json` should be copied over from the repo

  - Configure `config.json` to suit your needs
  - Launch the bot like so `docker compose -f docker-compose.yml --env-file .env up -d` 



## Manual Install (Hard)

- Make sure you have the [Rust Toolchain Installed](https://rust-lang.org)
- Make sure you have PostgreSQL 13 installed

1. Clone the repo
2. Run the `cargo build --release` command (Warning, Rust builds can be _extremely_ slow due to the Borrow Checker's Compile Time Checks)
3. Initialize Postgres with the provided `migrations/faculty_manager.sql` file
4. If everything worked so far, configure the `config.json` to your liking
5. Run `./target/release/faculty_manager` to launch the bot (Protip: Use a process manager to keep it running in the background!)