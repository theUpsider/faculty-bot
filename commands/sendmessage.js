const settings = require("../general-settings.json");
const discord = require("discord.js");

module.exports = {
  name: "sendmessage",
  description: "send a message as the bot",
  args: true,
  usage: "<channel name> <message>",
  guildOnly: false,
  aliases: ["sendm"],
  async execute(message, args) {
    // only for staff
    if (
      !message.member.roles.cache.has(
        message.member.guild.roles.cache.find(
          (role) => role.name === settings.roles.staffrole
        ).id
      )
    )
      return message.reply(
        `:x: You do not have permission to execute this command.`
      );

    const channel = await message.guild.channels.cache
      .find((channel) => channel.name == args[0])
      .fetch();
    channel.send(args.join(" "));

    return;
  },
};
