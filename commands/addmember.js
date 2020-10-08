const Keyv = require('keyv');
const settings = require('../general-settings.json')

module.exports = {
    name: "addmember",
    usage: "<discord ID>",
    args: true,
    guildOnly: true,
    aliases: ['addteammember'],
    async execute(message, args) {
        //db1
        // Key: teamname, Value: Teamleader (Summonername)
        const dbteams = new Keyv('sqlite://teams.sqlite')
        dbteams.on('error', err => console.error('Keyv connection error:', err));

        const category = await message.guild.channels.cache.find(channel => channel.id == message.channel.parentID).fetch();

        const role = await message.guild.roles.cache.find(role => role.name == category.name);

        const captainID = await dbteams.get((await message.guild.roles.fetch(role.id)).name); // is weird but works that way

        if (!captainID || captainID === undefined) {
            return message.reply('You have no team.')
        } else if ((captainID == message.author.id) || message.member.roles.cache.has(settings.roles.staffrole)) {

            const memberToAdd = await message.guild.members.cache.find(member => member.id == args[0]).fetch();
            memberToAdd.roles.add(role.id)
        }
        return message.reply('Member assigned.')
    }
}