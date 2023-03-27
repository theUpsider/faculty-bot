import { ContextMenuCommandBuilder, EmbedBuilder } from "discord.js";
import { prefix } from "../../general-settings.json";

import { CommandInteraction, Message, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import defineCommand from "../utils";


export default defineCommand({
  slashSetup: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all of my commands or info about a specific command.")
    .addStringOption(option => option.setName("command").setDescription("The command to get info about").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
    run: async (client, ctx, args): Promise<void> => {
        // discriminate if the command was run via slash or prefix
        const contextType = ctx instanceof Message ? "prefix" : "slash";
        const specificCommand = contextType === "prefix" ? (ctx as Message).content.split(" ")[1] : ( ctx as CommandInteraction ).options.get("command", false);

        const data: string[] = [];
        const { commands } = client;

        if (specificCommand) {
            const name = specificCommand?.toString();
            const command = commands.get(name);

            if (!command) {
                ctx.reply("That's not a valid command!");
                return;
            }

            data.push(`**Name:** ${command.slashSetup.name}`);

            const commandType = command.slashSetup instanceof SlashCommandBuilder ? "slash" : "contextmenu";

            if (commandType === "slash") {
                const slashCommand = command.slashSetup as SlashCommandBuilder;
                slashCommand.description ? data.push(`**Description:** ${slashCommand.description}`) : data.push(`**Description:** No description provided`);
                slashCommand.options ? data.push(`**Options:** ${slashCommand.options.map(option => option).join(", ")}`) : data.push(`**Options:** No options provided`);
                slashCommand.default_member_permissions ? data.push(`**Default Permission:** ${slashCommand.default_member_permissions}`) : data.push(`**Default Permission:** No default permission provided`);
            } else {
                const contextMenuCommand = command.contextMenuSetup as ContextMenuCommandBuilder;
                contextMenuCommand.default_member_permissions ? data.push(`**Default Permission:** ${contextMenuCommand.default_member_permissions}`) : data.push(`**Default Permission:** No default permission provided`);
                contextMenuCommand.type ? data.push(`**Type:** ${contextMenuCommand.type}`) : data.push(`**Type:** No type provided ???`);

            }

            ctx.reply({ content: data.toString(), ephemeral: false });

        }

        data.push(`Here's a list of all my commands:`);
        data.push(commands.map(command => command.slashSetup.name).join(", "));
        data.push(`\nYou can send \`/help [command name]\` to get info on a specific command!`);

        ctx.reply({ content: data.toString(), ephemeral: false });


    }
});

