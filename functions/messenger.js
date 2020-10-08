const discord = require("discord.js");
const settings = require('../general-settings.json')

module.exports = {
    async Log(message, Type, content) {
        let logChannel = message.guild.channels.cache.get(settings.channels.logs)

        const logEmbed = new discord.MessageEmbed()
            .setTitle(`**` + Type + `**`)
            .setColor(settings.colors.green)
            .setFooter(settings.footer)
            .setDescription(content)
        logChannel.send(logEmbed);
    },
    async Error(message,Title, content) {
        let logChannel = message.guild.channels.cache.get(settings.channels.logs)

        const logEmbed = new discord.MessageEmbed()
            .setTitle(`**`+Title+`**`)
            .setColor(settings.colors.red)
            .setFooter(settings.footer)
            .setDescription(content)
        logChannel.send(logEmbed);
    },
    //args: channel, Title, content
    async Embeded() {
        const args = arguments;
        const logEmbed = new discord.MessageEmbed()
            .setTitle(`**` + args[1] + `**`)
            .setColor(settings.colors.lightblue)
            .setFooter(settings.footer)
            .setDescription(args[2])
        args[0].send(logEmbed);
    },
    // message, settings color, title, text
    async EmbededColor() {
        const args = arguments;
        const logEmbed = new discord.MessageEmbed()
            .setTitle(`**` + args[2] + `**`)
            .setColor(args[1])
            .setDescription(args[3])
        args[0].send(logEmbed);
    }
}