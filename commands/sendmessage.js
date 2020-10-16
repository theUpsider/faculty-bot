const settings = require('../general-settings.json')
const discord = require("discord.js");

module.exports =
{
    name: 'sendmessage',
    description: 'send a message as the bot',
    args: true,
    usage: '<channel ID> <message>',
    guildOnly: false,
    aliases:['sendm'],
    async execute(message, args) {

        if (!message.member.roles.cache.has(settings.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

        const channel = await message.guild.channels.cache.find(channel => channel.id == args[0]).fetch()
        channel.send(args.join(' '))

        return;

    }
}