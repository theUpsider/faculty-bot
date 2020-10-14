const settings = require('../general-settings.json')
const discord = require("discord.js");

module.exports =
{
    name: 'sendmessage',
    description: 'send a message as the bot',
    args: true,
    usage: '<channel name> <message>',
    guildOnly: false,
    aliases:['sendm'],
    async execute(message, args) {

        if (!message.member.roles.cache.has(settings.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

        const channel = client.channels.cache.find(args[0])
        channel.send(args[1])
        //message.guild.channel.get(args[0]).send(args[1])

        return;

    }
}