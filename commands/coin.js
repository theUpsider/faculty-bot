const settings = require('../general-settings.json')
const Messenger = require('../functions/messenger.js')

module.exports = {
    name: "coin",
    args: false,
    guildOnly: true,
    aliases: ['coinflip', 'side'],
    async execute(message, args) {
        var rand = ["your team can choose a side.", "the enemy team may choose their side."];
        var color = [settings.colors.green, settings.colors.red]

        const result = Math.floor(Math.random() * rand.length)
        try {

            Messenger.EmbededColor(message.channel,color[result], result==0 ? "Win" : "Loss",message.author.username+", "+ rand[result] )
        } catch (error) {
            console.log(error)
        }
    }
}