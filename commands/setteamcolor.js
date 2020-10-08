const Keyv = require('keyv');
const settings = require('../general-settings.json')

module.exports = {
    name: "setteamcolor",
    usage: "<hex-color with hashtag>",
    args: true,
    guildOnly: true,
    aliases: ['setcolorteam'],
    async execute(message, args) {
        //db1
        // Key: teamname, Value: Teamleader (Summonername)
        const dbteams = new Keyv('sqlite://teams.sqlite')
        dbteams.on('error', err => console.error('Keyv connection error:', err));

        const category = await message.guild.channels.cache.find(channel => channel.id == message.channel.parentID).fetch();

        const role = await message.guild.roles.cache.find(role => role.name == category.name);

        const captainID = await dbteams.get((await message.guild.roles.fetch(role.id)).name); // is weird but works that way

        if (!captainID || captainID === undefined) {

        } else if ((captainID == message.author.id) || message.member.roles.cache.has(settings.roles.staffrole)) {

            //if wrong hex code return
            if (args[0].startsWith("#") && args[0].length == 7)
            (await message.guild.roles.fetch(role.id)).setColor(args[0])
            else
                return message.reply('Color not valid. Try this format: #123456.')
        }
        return message.reply('Color assigned.')
    }
}