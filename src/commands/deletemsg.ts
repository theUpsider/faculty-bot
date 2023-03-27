import { ApplicationCommandOptionType, ApplicationCommandType, CommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Message, PermissionFlagsBits, SlashCommandBuilder, Snowflake, TextChannel } from "discord.js";
import settings from "../../general-settings.json";
import defineCommand from "../utils";


defineCommand({
    slashSetup: new ContextMenuCommandBuilder()
    .setName("delete-message")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    run: async (client, ctx, args): Promise<void> => {

        // we can safely assume that the context is a context menu command interaction always
        const msg = ( ctx as ContextMenuCommandInteraction ).options.getMessage("message", true);

        msg.deletable ? msg.delete() : ctx.reply("Message is not deletable!");
    }
        
});        

module.exports = {
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
            msg.delete();
            message.channel.send(`:white_check_mark: Message with id **${msgId}** pinned!`);
        })
        .catch(() => {
            return message.reply("The message id is invalid!");
        });

    }
}