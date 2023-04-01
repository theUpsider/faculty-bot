import { Message, TextChannel } from "discord.js";
const settings = require("../../general-settings.json");
const discord = require("discord.js");

const blah = {
  name: "rupdate",
  admin: true,
  description: "updates the ruleset",
  args: true,
  usage: '<"new ruleset">',
  guildOnly: false,
  async execute(message: Message, args: string[]) {
    // only for staff
    if (
      !message.member!.roles.cache.find(
        role => role.name === settings.roles.staffrole
      )
    )
      return message.reply(
        `:x: You do not have permission to execute this command.`
      );

    if (settings.channels.rules && settings.channels.rules) {
      let rulesChn = await message.guild?.channels.cache.find(
        chn => chn.name == settings.channels.rules
      )?.fetch() as TextChannel;

      let rulesMsg = await (await rulesChn.messages.fetch({ limit: 1 })).first();
      rulesMsg?.edit(
        args.join(" ")
      )
      .catch(console.error);

    }
    else message.reply("wrong arguments supplied");

    return;
  },
};
