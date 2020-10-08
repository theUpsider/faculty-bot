const Keyv = require('keyv');
const settings = require('../general-settings.json')
const discord = require("discord.js");
const {toLevel} =  require('../functions/extensions.js');

module.exports =
{
    name: 'xp',
    description: 'displays your XP and Level',
    args: false,
    guildOnly: true,
    aliases: ['level','exp','progress'],
    async execute(message, args) {

                //db1
        // Key: iD, Value: XP
        const dbxp = new Keyv('sqlite://xp.sqlite')
        dbxp.on('error', err => console.error('Keyv connection error:', err));
        //if (!message.member.roles.cache.has(settings.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

        const userXP = await dbxp.get(message.author.id); // is weird but works that way

        if (!userXP || userXP === undefined) {
			await dbxp.set(message.author.id, 1) // set to 1 for 1 XP
			return;
		} else {
            message.reply(`you have ${userXP} XP. This equals to ${toLevel(userXP)} Levels.`)
        }
        return;

    }
}