import { Message, TextChannel } from "discord.js";
import settings from "../../general-settings.json";

module.exports = {
    name: "unpinmsg",
    description: "Unpins a message by its Id in the current channel",
    args: true,
    usage: "<message id>",
    guildOnly: true,
    cooldown: 5,
    aliases: ["unpinmsg", "unpin"],
    async execute(message: Message, args: string[]) {

        if (
            !message.member!.roles.cache.find(role => role.name === settings.roles.staffrole)
            || !message.member!.roles.cache.find(role => role.name === settings.roles.semestermodrole)
          )
            return message.reply(
              `:x: You do not have permission to execute this command.`
            );
        if (args.length < 1) {
            return message.reply("You need to provide a channel id and a message id!");
        }

        let msgId = args.shift();
        
        message.channel.messages.fetch(msgId as string)
        .then(msg => {
          msg.pinned ? msg.unpin() : null;
          message.channel.send(`:white_check_mark: Message with id **${msgId}** unpinned`);
        })
        .catch(() => {
            return message.reply("The message id is invalid!");
        });

    }
}