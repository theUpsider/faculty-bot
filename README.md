# League of Legends Tournament bot (Discord)
## Introduction
This project features a Discord bot, with the intend to reduce the administration overhead for tournament hosts. The bot takes care of verifying new server members and grouping players into teams. In the future it will take care of match results and matchmaking.

## Setting up the bot
- To run the code itself, first you need [Node.js](https://nodejs.org/en/). Install this JavaScript runtime. 
- You need to download the project and execute  
`npm install` inside the primary folder using Powershell (on Windows). This will install the neccesary dependencies.  
- Then you need to create a json file inside the directiory named: `config.json`. Inside you need to fill in the values needed to launch the bot: the discord developer API token, the riotapikey and the prefix used for every command:  
```
{
	"prefix": "..",
	"token": "TOKENGOESHERE",
	"riotapikey": "RIOTKEYGOESHERE"
}
```  
- To register the bot, a developer account at [Discord](https://discord.com/developers/) needs to be created. The key can be filled in the `config.json` under `token`.  
- To finally launch the bot, use `node index.js` in Powershell to launch the bot. Press CTRL + c to end the execution. The console will give useful log.
## Bot Settings
In order for the bot to communicate with channels, you need to edit the `general-settings.json` and paste in the IDs of the channels and roles. Those need to be created before launching the bot.
### Roles
staffrole: this is the tournament management role, which may edit the bot via commands.  
verified: after a playeer verified with his ingame account. Use this role as you please, maybe to show and hide some channels.  
EUW1 / ...: those roles will be assinged after verification as well. Use this to tag or group players.  
### Channels
- logs : where the information for the management and staff gets logged. Like a closed ticket or similar.  
- greetings : where new players get welcomed
- information : where useful information for everyone gets posted by the bot
- ticketcat : the category tickets will be created (category!)
- logs : where log files are beeing posted to. Useful for staff.
### Other
The footer can be set int the config. It will be displayed below supportive messages.
## Commands
In general, a command can be used without any arguments to get additional information about it.
- add : adds a user to a ticket by his discord ID. Only for staff role.
- addmember : adds a verified user to a team by his discord ID. Only teamcaptains of registered teams can use this command.
- close : closes a ticket. Used by staff to mark and log a problem as resolved.
- coin : returns the user wether his team may choose sides or the enemy team. Used in pre game lobby.
- deleteteam : Teamcaptains may delete their team and with it the corresonding role.
- move : *not implemented yet*
- registerteam : allows a player to be teamcaptain and register a team with a name.
- remove : *not implemented yet*
- removemember : allows teamcaptains to remove a teammember by his discord ID.
- setteamcolor : used during the setup of a team to change and set its color (role).
- ticket : opens a ticket, the support and staff can look into. This may range from general inqueries to specific problems the players may have.
- verify : guides the user trhough a setup using the riot api to determine his ownership of a LoL account and sets his nickname and region accordingly.

## Thanks
The bot is in a early state. Feedback is appreciated.
