# Usability bot (Discord)

## Introduction

This project features a Discord bot, with the intend to reduce the administration overhead for usability tasks. The bot takes care of verifying new server members.

## Setting up the bot

- To run the code itself, first you need [Node.js](https://nodejs.org/en/). Install this JavaScript runtime.
- You need to download the project and execute  
  `npm install` inside the primary folder using Powershell (on Windows). This will install the neccesary dependencies.
- Then you need to create a json file inside the directiory named: `config.json`. Inside you need to fill in the values needed to launch the bot: the discord developer API token, mail pw and the prefix used for every command:

```
{
	"prefix": "..",
	"token": "TOKENGOESHERE",
	"mailpw": "EMAILPWGOESHERE"
}
```

- To register the bot, a developer account at [Discord](https://discord.com/developers/) needs to be created. The key can be filled in the `config.json` under `token`.
- To finally launch the bot, use `node index.js` in Powershell to launch the bot. Press CTRL + c to end the execution. The console will give useful log.

## Bot Settings

In order for the bot to communicate with channels, you need to edit the `general-settings.json` and paste in the names of the channels and roles. Those need to be created before launching the bot. Case sensitive!

### Roles

staffrole: this is the management role, which may edit the bot via commands.  
verified: after a playeer verified with his account. Use this role as you please, maybe to show and hide some channels.

### Channels

- logs : where log files are beeing posted to. Useful for staff.
- greetings : where new players get welcomed
- news : where useful information for everyone gets posted by the bot
- xp : where level ups get posted
- rules : where your server rules are located

### Other

In the config.js, the mail server and aithentication in verify.js needs to be filled in.

## Commands

In general, a command can be used without any arguments to get additional information about it.

- help : displays general information
- rulesupdate: updates the server rules
- sendmessage: useful to let the bot send the server rules, which can later be updated with rulesupdate-command
- xp: displays current xp and level

## Thanks

The bot is in a early state. Feedback is appreciated.
