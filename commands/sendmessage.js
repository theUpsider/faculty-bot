const settings = require('../general-settings.json')
const discord = require("discord.js");

module.exports =
{
    name: 'sendmessage',
    description: 'send a message as the bot',
    args: true,
    usage: '<channelID> <message>',
    guildOnly: false,
    aliases:['sendm'],
    async execute(message, args) {

        if (!message.member.roles.cache.has(settings.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

        (await message.guild.channels.cache.find(args[0]).fetch()).send(args[1])
        //message.guild.channel.get(args[0]).send(args[1])

        return;

    }
}