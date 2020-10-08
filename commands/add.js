const settings = require('../general-settings.json')
const discord = require("discord.js");

module.exports =
{
    name: 'add',
    description: 'add user to a ticket',
    args: true,
    usage: '<ID>',
    guildOnly: true,
    async execute(message, args) {

        if (!message.member.roles.cache.has(settings.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

        // check if user exists
        if (! message.guild.member(args[0])) return message.channel.send(`:x: Incorrect user ID (use the numbers not the username).`)

        else {
            message.channel.updateOverwrite(args[0], { VIEW_CHANNEL: true });

            message.channel.send(`Added <@${args[0]}> to this ticket.`)

        }

    }
}