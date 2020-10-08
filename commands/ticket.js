const discord = require('discord.js');
const settings = require('../general-settings.json')
const randomChars = require('random-chars')

module.exports =
{
    name: 'ticket',
    description: 'Creates a ticket',
    cooldown: 1,
    aliases: ['support'],
    async execute(message, args) {

        const exampleEmbed = new discord.MessageEmbed()
            .setColor(settings.colors.lightblue)
            .setTitle(`Options`)
            .setDescription(`💡 - Support\n⏱️ - Did not recieve my product\n🔑 - Forgot my credentials\n📃 - Apply`)
            .setFooter(settings.footer);

        message.channel.send(exampleEmbed)
            .then(async msg => {
                await msg.react('💡')
                await msg.react('⏱️')
                await msg.react('🔑')
                await msg.react('📃')
                let filter = (reaction, user) => {
                    return ['💡', '⏱️', '🔑', '📃'].includes(reaction.emoji.name) && user.id === message.author.id;
                }
                msg.awaitReactions(filter, { max: 1, time: 17000, errors: ['time'] })
                    .then(collected => {
                        let option = ''
                        const reaction = collected.first()
                        message.channel.send('Creating ticket....')
                        message.guild.channels.create('ticket-' + randomChars.get(6),
                            {
                                type: 'text',
                                permissionOverwrites: [
                                    {
                                        id: settings.roles.staffrole,
                                        allow: ['VIEW_CHANNEL'],
                                    },
                                    {
                                        id: message.author.id,
                                        allow: ['VIEW_CHANNEL']
                                    },
                                    {
                                        id: message.guild.id,
                                        deny: ['VIEW_CHANNEL']
                                    }
                                ]
                            })
                            .then(channel => {
                                channel.setParent(settings.channels.ticketcat)
                                channel.updateOverwrite(message.guild.id, { VIEW_CHANNEL: false });
                                channel.updateOverwrite(message.author.id, { VIEW_CHANNEL: true });
                                channel.updateOverwrite(settings.roles.staffrole, { VIEW_CHANNEL: true });

                                if (reaction.emoji.name === '💡') {
                                    let embed = new discord.MessageEmbed()
                                        .setTitle(`Support ticket`)
                                        .setColor(settings.colors.lightblue)
                                        .setDescription(`Hello there **`+message.author.username +`**, tell us about your issue and one of our staff members will respond as quick as possible. And also if you have any questions feel free to ask it in here.`)
                                        .setFooter(settings.footer)
                                    channel.send(embed)
                                }

                                if (reaction.emoji.name === '⏱️') {
                                    let embed2 = new discord.MessageEmbed()
                                        .setTitle(`Product not received`)
                                        .setColor(settings.colors.lightblue)
                                        .setDescription(`Hello, could you please send us the PayPal transaction ID and the Order ID so we can activate your order and the product should be created automatically.`)
                                        .setFooter(settings.footer)

                                    channel.send(embed2)
                                }

                                if (reaction.emoji.name === '🔑') {
                                    let embed3 = new discord.MessageEmbed()
                                        .setTitle(`Credentials lost`)
                                        .setColor(settings.colors.lightblue)
                                        .setDescription(`Hello, could you send us your email, first and last name so we can reset your password or/and username.`)
                                        .setFooter(settings.footer)

                                    channel.send(embed3)
                                }

                                if (reaction.emoji.name === '📃') {
                                    let embed4 = new discord.MessageEmbed()
                                        .setTitle(`Application`)
                                        .setColor(settings.colors.lightblue)
                                        .setDescription(`Hello, if you want to apply for the management click [here](https://forms.gle/Xehxo8vkjTkdz64i6)\nAnd if you want to apply for member support or as a streamer click click [here](https://forms.gle/fUyqHK7jULvMc3xo9)`)
                                        .setFooter(settings.footer)
                                    channel.send(embed4)
                                }


                            })

                    }).catch(e => console.log(e))
            })

    }

}