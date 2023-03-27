const settings = require("../../general-settings.json")
import { validateEmail } from "../functions/extensions"
import { CommandInteraction, Message, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import defineCommand from "../utils";


import Keyv from "keyv";

export default defineCommand({
  slashSetup: new SlashCommandBuilder()
    .setName("getbymail")
    .setDescription("gets the verificationdate and discordname")
    .addStringOption(option => option.setName("email").setDescription("The email to get the verificationdate and discordname").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    run: async (client, ctx, args): Promise<void> => {
        // discriminate if the command was run via slash or prefix
        let discordId, isMailAsArg = false;
        const email = (ctx as CommandInteraction).options.get("email", true).value?.toString();

        client.dbverify.get(email).then((value) => {
          if (value) {
            discordId = value.discordId;
          }
        })
        .catch((err) => {
          ctx.reply({ content: `:x: Error: ${err}`, ephemeral: true });
        });

        if (!discordId) {
          ctx.reply({ content: `:x: No user found with email ${email}`, ephemeral: true });
        }

        const member = ctx.guild!.members.cache.find(member => member.id === discordId);

        ctx.reply({ content: `User ${member!.user.tag} has verified with the following email: ${email}`, ephemeral: true });
    }
})
