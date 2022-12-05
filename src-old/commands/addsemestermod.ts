import { Message, TextChannel } from "discord.js";
import settings from "../../general-settings.json";

module.exports = {
    name: "addsemestermod",
    description: "Promotes a user to semester moderator",
    args: true,
    usage: "<user-id>",
    guildOnly: true,
    cooldown: 5,
    aliases: ["semmod"],
    async execute(message: Message, args: string[]) {

        if (
            !message.member!.roles.cache.find(
              role => role.name === settings.roles.staffrole
            )
          )
            return message.reply(
              `:x: You do not have permission to execute this command.`
            );
        if (args.length < 1) {
            return message.reply("You need to provide a channel id and a message id!");
        }

        let usrId = args.shift();
        
        let usr = message.guild!.members.cache.find(
            member => member.id === usrId
            );
        if (!usr) {
            return message.reply("User not found!");
        }
        let role = message.guild!.roles.cache.find(
            role => role.name === settings.roles.semestermodrole
            );
        if (!role) {
            return message.reply("Role not found!");
        }

        if (usr.roles.cache.find(
            role => role.name === settings.roles.semestermodrole
            )) {
            return message.reply("User is already a semester moderator!");
        }

        await usr.roles.add(role);

        return message.reply(`Successfully added ${usr.user.tag} to semester moderators!`);

    }
}