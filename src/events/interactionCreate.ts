import { ChatInputApplicationCommandData, ChatInputCommandInteraction, DMChannel, Guild, GuildChannel, Interaction } from "discord.js";
import Keyv from "keyv";
import { FacultyManager } from "../index";

module.exports = {
    event: "interactionCreate",
    async execute (client: FacultyManager, [interaction]: [Interaction]) {
        if (interaction.isChatInputCommand()) {
            const int = interaction as ChatInputCommandInteraction;
            int.reply("Hello world!");
        }
    }

}