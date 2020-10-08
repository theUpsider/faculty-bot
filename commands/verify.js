const settings = require('../general-settings.json')
const discord = require("discord.js");
const { prefix, token, riotapikey } = require('../config.json');
const Keyv = require('keyv');
var RiotRequest = require('riot-lol-api');
const Messenger = require('../functions/messenger.js')

//Riot API 
var riotRequest = new RiotRequest(riotapikey);

module.exports =
{
    name: 'verify',
    description: 'get verified to participate',
    guildOnly: true,
    args: false,    
    aliases: ['verifyme','config'],
    async execute(message, args) {

        if (args.length < 1) {
            const exampleEmbed = new discord.MessageEmbed()
                .setColor(settings.colors.lightblue)
                .setTitle(`Verification`)
                .setDescription(message.author.username + `, to verify, please set your LoL profile icon to the default rose icon, then react with thumbs up. React with thumbs down to cancel.`)

            message.channel.send(exampleEmbed)
                .then(async msg => {
                    await msg.react('👍')
                    await msg.react('👎')
                    let filter = (reaction, user) => {
                        console.log(reaction.emoji.name)
                        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
                    }
                    msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {

                            const reaction = collected.first()
                            if (reaction.emoji.name === '👍') {
                                Messenger.Embeded(message.channel, 'Provide your account', 'Now type your region and account you want to verify like: **<euw> <Summonername>** without the brackets.')

                                // Get name and region
                                const filter = m => {
                                    return m.author.id === message.author.id
                                }; // check if sender
                                message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                    .then(collected => {

                                        const region = ['euw europe euw', 'na northamerica', 'eun eune euna ']
                                        const regionsReal= ["EUW1","NA1","EUN1"];
                                        var finalRegion = regionsReal[0];
                                        for (var i = 0, len = region.length; i < len; i++) {
                                            if (region[i].includes(collected.first().content.split(' ')[0].toLowerCase())) {
                                                switch (i) {
                                                    case 0:
                                                        finalRegion = regionsReal[0];
                                                        break;
                                                    case 1:
                                                        finalRegion = regionsReal[1];
                                                        break;
                                                    case 2:
                                                        finalRegion = regionsReal[2];
                                                        break;

                                                    default:
                                                        return message.reply('Your region is currently not supported.')
                                                }
                                            }
                                        };

                                        // API check
                                        riotRequest.request(finalRegion, 'summoner', '/lol/summoner/v4/summoners/by-name/' + collected.first().content.split(' ')[1], function (err, SummonerDTO) {
                                            if (err == null) {

                                                // ==7 is the rose
                                                //if verified icon, add verified role
                                                if (SummonerDTO.profileIconId == 7) {

                                                    message.member.roles.add(settings.roles.verified)
                                                    message.member.roles.add(settings.roles[finalRegion])
                                                    try {
                                                        message.member.setNickname(finalRegion.toUpperCase() + " | " + SummonerDTO.name);
                                                        return message.reply('You got verified. Congratulation!')
                                                    } catch (error) {
                                                        console.log(error);
                                                    }



                                                } else {
                                                    //wrong icon
                                                    return message.reply('Your icon is not set to the default rose. We could not verify your account.')
                                                }
                                            }
                                        })
                                    })
                                    .catch(collected => {
                                        message.channel.send('Looks like you provided the wrong region or username or you timed out. Please check the spelling and try again.');
                                    });
                            } else {

                                return message.reply('Canceled...');
                            }

                        }).catch(e => console.log(e))
                })
        }

    }
}