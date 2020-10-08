const Keyv = require('keyv');
const settings = require('../general-settings.json')

module.exports = {
    name: "removemember",
    usage: "<discord ID>",
    args: true,
    guildOnly: true,
    aliases: ['removeteammember','deletemember','deleteteammember','unassignmember','unassign'],
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

            const memberToAdd = await message.guild.members.cache.find(member => member.id == args[0]).fetch();
            if(memberToAdd.id != message.author.id)
            memberToAdd.roles.remove(role.id)
            else
            return message.reply('You can not remove yourself from the team. Try to delete the team instead if you wish so.')

        }
        return message.reply('Member removed.')
    }
}