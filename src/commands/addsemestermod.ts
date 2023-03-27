import { ApplicationCommandOptionType, CommandInteraction, Message, PermissionFlags, PermissionFlagsBits, SlashCommandAssertions, SlashCommandBuilder, TextChannel } from "discord.js";
import defineCommand from "../utils";
import settings from "../../general-settings.json";


export default defineCommand({
    slashSetup: new SlashCommandBuilder()
    .setName("addsemestermod")
    .setDescription("Add a user to semester moderators")
    .addUserOption(option => option.setName("user").setDescription("The user to add to semester moderators").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    run: async (client, ctx, args): Promise<void> => {
        // discriminate if the command was run via slash or prefix
        const contextType = ctx instanceof Message ? "prefix" : "slash";

        // get the user to promote
        const user = contextType === "prefix" ? (ctx as Message).mentions.users.first() : ( ctx as CommandInteraction ).options.getUser("user", true);

        // get the role to add
        const role = ctx.guild!.roles.cache.find(role => role.name === settings.roles.semestermodrole);

        // get the member to promote
        const member = ctx.guild!.members.cache.find(member => member.id === user!.id);

        // check if the user is already a semester moderator
        if (member!.roles.cache.find(role => role.name === settings.roles.semestermodrole)) {
            ctx.reply("User is already a semester moderator!");
            return;
        }

        // add the role to the member
        await member!.roles.add(role!);

        ctx.reply(`Successfully added ${user!.tag} to semester moderators!`);


    }
});
