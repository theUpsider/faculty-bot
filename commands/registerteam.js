const Keyv = require('keyv');
const discord = require("discord.js");
const settings = require('../general-settings.json')
const Messenger = require('../functions/messenger.js')
const { prefix, token, riotapikey } = require('../config.json');
const setteamcolor = require('./setteamcolor.js')
var RiotRequest = require('riot-lol-api');

//Riot API 
var riotRequest = new RiotRequest(riotapikey);

module.exports =
{
    name: 'registerteam',
    description: 'registers a team from scratch. You will be guided through the setup process.',
    args: true,
    usage: "<teamname>",
    guildOnly: true,
    async execute(message, args) {
        //db1
        // Key: teamname, Value: Teamleader (Summonername)
        const dbteams = new Keyv('sqlite://teams.sqlite'); // const keyv = new Keyv(); // for in-memory storage //
        dbteams.on('error', err => console.error('Keyv connection error:', err));

        const captainname = await dbteams.get(args[0]);
        // create team
        if (!captainname || captainname === undefined) {
            //db entry
            await dbteams.set(args[0], message.author.id)

            //Role
            const role =await message.guild.roles.create({
                data: {
                    name: args[0],
                    color: 'BLACK',
                },
                reason: 'a new team was created',
            })
                .then(Messenger.Log(message, "Team created", "Team: **" + args[0] + "\n** created by: **"+ message.author.username+"**."))
                .catch(console.error);

            // Add Captain to Role
            message.member.roles.add(role).catch(console.error);

            //Category
            const category =await message.guild.channels.create(args[0], {
                type: 'category',
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ['VIEW_CHANNEL'],
                    },
                    {
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL']
                    }
                ],
            })


            //Text Channel
            const textchannel = await message.guild.channels.create('general', {
                type: 'text',
                parent: category
            })

            //Voice Channel
            const voicechannel = await message.guild.channels.create('Voice', {
                type: 'voice',
                parent: category
            })

            //Continue asking for teammembers etc
            Messenger.Embeded(textchannel,"Team Creation","To finish the setup. The teamcaptain "+message.author.username+" needs to set the color using "+ setteamcolor.name+ " " + setteamcolor.usage +
            "\nThen use addteammember discord ID too add members to your team")

        } else {
            return message.reply(`:x: A Team with this name is already registered.`)
        }
    }
}