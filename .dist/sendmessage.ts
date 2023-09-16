import { Message, TextChannel } from "discord.js";
const settings = require("../../general-settings.json")
const discord = require("discord.js");

const blah = {
  name: "sendmessage",
  admin: true,
  description: "send a message as the bot",
  args: true,
  usage: "<channel name> <message>",
  guildOnly: false,
  aliases: ["sendm"],
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


      const targetChn = await message.guild?.channels.cache.find(
        chn => chn.name == args[0]
      )?.fetch() as TextChannel;

    /* const channel = await message.guild?.channels.cache
      .find((channel) => channel.name == args[0])?
      .fetch(); */
    targetChn.send(args.join(" "));

    return;
  },
};
