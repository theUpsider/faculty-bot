import { ChatInputApplicationCommandData, ChatInputCommandInteraction, DMChannel, Guild, GuildChannel, Interaction } from "discord.js";
import Keyv from "keyv";
import { FacultyManager } from "../index";

module.exports = {
    event: "interactionCreate",
    async execute (client: FacultyManager, [interaction]: [Interaction]) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.run(client, interaction, []);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }

}