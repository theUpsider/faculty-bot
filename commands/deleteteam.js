const Keyv = require('keyv');
const discord = require("discord.js");
const settings = require('../general-settings.json')
const Messenger = require('../functions/messenger.js')
const { prefix, token, riotapikey } = require('../config.json');
const setteamcolor = require('./setteamcolor.js')
var RiotRequest = require('riot-lol-api');

module.exports =
{
    name: 'deleteteam',
    description: 'deletes a team.',
    args: true,
    usage: "<teamname>",
    guildOnly: true,
    aliases: ['removeteam'],
    async execute(message, args) {
        //db1
        // Key: teamname, Value: Teamleader (Summonername)
        const dbteams = new Keyv('sqlite://teams.sqlite'); // const keyv = new Keyv(); // for in-memory storage //
        dbteams.on('error', err => console.error('Keyv connection error:', err));

        const captainID = await dbteams.get(args[0]);
        // create team
        if (!captainID || captainID === undefined) {
          
        } else if ((captainID == message.author.id) || message.member.roles.cache.has(settings.roles.staffrole)) {

            const category = await message.guild.channels.cache.find(channel => channel.name == args[0]).fetch();
            if (category) {
                message.guild.channels.cache.forEach(channel2 => {
                    if (channel2.parentID == category.id)
                        channel2.delete();
                });
                
                const role =await message.guild.roles.cache.find(role => role.name == args[0]);
                (await message.guild.roles.fetch(role.id)).delete();
                await dbteams.delete(args[0]);
                category.delete();
                Messenger.Error(message,'Team Deletion','Team: **'+args[0]+'** \ndeleted by **'+ message.author.username+'**.')
            }
        }
    }
}