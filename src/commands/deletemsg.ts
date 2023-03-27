import { ApplicationCommandOptionType, ApplicationCommandType, CommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Message, PermissionFlagsBits, SlashCommandBuilder, Snowflake, TextChannel } from "discord.js";
import settings from "../../general-settings.json";
import defineCommand from "../utils";


export default defineCommand({
    contextMenuSetup: new ContextMenuCommandBuilder()
    .setName("delete-message")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    run: async (client, ctx, args): Promise<void> => {

        // we can safely assume that the context is a context menu command interaction always
        const msg = ( ctx as ContextMenuCommandInteraction ).options.getMessage("message", true);

        msg.deletable ? msg.delete() : ctx.reply("Message is not deletable!");
    }
        
});        
