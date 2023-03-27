import { ApplicationCommandOptionType, CommandInteraction, Message, User, GuildMember, PermissionFlagsBits, SlashCommandBuilder, REST, Routes, ContextMenuCommandBuilder, SelectMenuBuilder } from "discord.js";
import { FacultyManager } from ".";
import fetch from "node-fetch";

// d.js stuff

type SlashArgOptions = {
    name: string;
    description: string;
    type: ApplicationCommandOptionType;
    required?: boolean; // default false
}

export interface CommandDefinition {
    slashSetup?: SlashCommandBuilder | ContextMenuCommandBuilder;
    run: (client: FacultyManager, ctx: CommandInteraction | Message, args: string[]) => Promise<void>;
}




export default function defineCommand<T extends CommandDefinition>(command: T): T {
    return command;
}

export function isCommandInteraction(ctx: CommandInteraction | Message): ctx is CommandInteraction {
    return (ctx as CommandInteraction).isCommand !== undefined;
}

export function isMessage(ctx: CommandInteraction | Message): ctx is Message {
    return (ctx as Message).content !== undefined;
}

export async function register_commands(commands: CommandDefinition[], client: FacultyManager): Promise<boolean> {
    const rest = new REST({ version: '10' }).setToken(client.token);
    for (const command of commands) {
        if (!command.slashSetup) {
            console.log(`Skipping a command without slash setup`);
            continue;
        }
        console.log(`Registering command ${command.slashSetup?.name}`);
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            const data = await rest.put(
                Routes.applicationCommands("1025099279561392189"),
                { body: commands.map(command => command.slashSetup?.toJSON()) },
            );

            console.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    }

    return true;
}