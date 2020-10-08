const discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    if (!message.member.roles.cache.has(bot.config.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

    if (args[0] !== message.guild.members.cache.get(args[0])) return message.channel.send(`:x: Incorrect user ID.`)

    else {
        message.channel.updateOverwrite(args[0], { VIEW_CHANNEL: false });

        message.channel.send(`Removed <@${args[0]}> to this ticket.`)

    }
    
}

module.exports.help = {
    name: "remove",
    description: "Sluit een ticket.",
}