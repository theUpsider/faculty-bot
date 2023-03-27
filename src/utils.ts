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
    slashSetup?: SlashCommandBuilder,
    contextMenuSetup?: ContextMenuCommandBuilder,
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
   
    return true;
}