# Faculty bot (Discord)

## Introduction

This project features a Discord bot with the intent to reduce the administration overhead for faculty related tasks. The bot takes care of verifying new server members.

## Setting up the bot

- To run the code itself, first you need [The Rust Programming Language](https://rust-lang.org).
  Install this using `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` and choose the `stable` toolchain
- You need to download the project and execute  
  `cargo build --release` inside the primary folder using Windows Terminal or any zsh/bash on *nix systems. This will compile a release optimized build of the bot


- Create a `.env` file with the following content:
```sh
DISCORD_TOKEN=

# PostgreSQL format e.g. postgres://dbuser:dbpass@localhost:5432/db_name
DATABASE_URL=

PREFIX=

MAILUSER=
MAILPW=
SMTP_SERVER=
SMTP_PORT=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# optional, but recommended if you want logs
RUST_LOG=warn
```

- To register the bot, you'll need to register an application at [Discord's Developer Portal](https://discord.dev) The Token should be filled in the `.env` file under `DISCORD_TOKEN` key.
- To finally launch the bot, use `docker compose up -d` or `docker-compose up -d`


## Bot Settings

In order for the bot to communicate with channels, you need to edit the `config.json` and paste in the Id's of the channels and roles. 
Those need to be created before launching the bot.

### Roles

- staffrole: this is the management role, which may edit the bot via commands.  
- verified: after a user verified with his account. Use this role as you please, maybe to show and hide some channels.
- mealplannotify: role id which will get pinged if a new mealplan has been posted

### Channels

- logs : where log files are beeing posted to. Useful for staff.
- greetings : where new players get welcomed
- news : where useful information for everyone gets posted by the bot
- xp : where level ups get posted
- rules : where your server rules are located
- ads: where external members may post ads which automatically get deleted after a specified amout of time in the settings
- createChannel: Upon joining a channel with this name, a temporary voice channel will be created
- mealPlan: channel to which the mealplan updates get posted


### Settings

Here you may speficy other adjustable settings of the bot.
- adstimeout: the time in milliseconds before an ad in the ads-channel gets deleted
- CharsForLevel: how many characters in a message should equal to 1 XP 
- postMealplan: (bool) activates the mealplan posting functionality
	- mealplan : (url) place to download mealplan i.e. http://www.meal/one.pdf
    - mealplan-check": (u16) minutes between the mealplan update check
    - postOnDay": (String) weekday on which the check and post occurs "Monday - Sunday"
	- postAtHour (String) Hour at which the plan will be posted ex. 18:00:00 and 18:30:00 will both post at 6PM
    - mealplansettings": (list) default settings for the converter. change if applicable
      - density": 400,
      - quality": 100,
      - flatten: true
      - width": 768,
      - height": 512
    }


## Commands


- help: displays general information
- rulesupdate <"new rules">: updates the server rules. Only usable by staffrole.
- sendmessage <channel name> <"message">: useful to let the bot send the a the server rules to a channel intitally, which can later be updated with rulesupdate-command. only staffrole.
- verify <student email>: The bot checks the mail inbox and assigns the student the `verified` role
- xp: displays current xp and level
- register: Registers Discord Slash Commands, only usable by members with the [MANAGE_GUILD](https://discord.com/developers/docs/topics/permissions#permissions#MANAGE_GUILD) permission

## Thanks

Feedback is appreciated.
