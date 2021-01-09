const settings = require("../general-settings.json");
const discord = require("discord.js");

module.exports = {
  name: "rupdate",
  admin: true,
  description: "updates the ruleset",
  args: true,
  usage: '<"new ruleset">',
  guildOnly: false,
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

    if (settings.channels.rules && settings.messages.rules)
      (
        await message.guild.channels.cache
          .find((channel) => channel.name == settings.channels.rules)
          .fetch()
      ).messages
        .fetch({ limit: 1 })
        .then((message) => message.edit(args.join(" "))) // remove symbols
        .catch(console.error);
    else message.reply("wrong arguments supplied");

    return;
  },
};
