import { GuildMember, EmbedBuilder, TextChannel, Colors } from "discord.js";
import Keyv from "keyv";
import { FacultyManager } from "../index";
import settings from '../../general-settings.json'

module.exports = {
    event: "guildMemberAdd",
    async execute (client: FacultyManager, [member] : [GuildMember], { dbxp } : { dbxp: Keyv }) {

        const embed = new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setTitle("A new user has joined")
            .setDescription(
                `Welcome **${member.user.username}** to the tournament server! Before doing anything else read <#${settings.channels.news}> and <#${settings.channels.rules}>. Any further questions should be directed towards our staff. Enjoy your stay!`
            )
        try {
            let welcomeChn = member.guild.channels.resolve(
                settings.channels.logs
            ) as TextChannel;
            welcomeChn.send({
                embeds: [
                    embed
                ]
            })
        } catch (error) {
            console.error
        }
         // const embeded = new Discord.MessageEmbed()
  // 	.setColor(settings.colors.blue)
  // 	.setTitle(`A new user has joined`)
  // 	.setDescription(`Welcome **` + member.user.username + `** to the tournament server! Before doing anything else read <#${settings.channels.information}> and <#${settings.channels.rules}>. Any further questions should be directed towards our staff. Enjoy your stay!`)
  // 	.setFooter(settings.footer);
  // try {
  // 	member.guild.channels.resolve(settings.channels.greetings).send(embeded);
  // } catch (error) {
  // 	console.log(error)
  // }
    }
}