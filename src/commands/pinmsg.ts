import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Message, PermissionFlagsBits, TextChannel } from "discord.js";
import defineCommand from "../utils";
import settings from "../../general-settings.json";


export default defineCommand({
  contextMenuSetup: new ContextMenuCommandBuilder()
  .setName("Pin or Unpin Message")
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  run: async (client, ctx, args): Promise<void> => {

      // we can safely assume that the context is a context menu command interaction always
      const msg = ( ctx as ContextMenuCommandInteraction ).options.getMessage("message", true);

      msg.pinned ? 
        msg.unpin() : 
          msg.pinnable ?
            msg.pin() :
              ctx.reply("Message is not pinnable!");
  }
      
});        



