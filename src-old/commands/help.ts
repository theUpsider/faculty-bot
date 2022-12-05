import { Message, MessageEmbed } from "discord.js";

const { prefix } = require("../../config.json");
module.exports = {
  name: "help",
  admin: false,
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands"],
  usage: "<command name>",
  cooldown: 5,
  execute(message: Message, args: any) {
    const data: string[] = [];

    const { commands } = message.client as any;

    if (!args.length) {
      data.push("Here's a list of all my commands:");
      data.push(commands.map((command: any) => command.name).join(", "));
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      );

      return message.author
        .send({
			embeds: [
				new MessageEmbed()
				.setTitle("Command Help")
				.setDescription(data.toString())
			]
		})
        .then(() => {
          if (message.channel.type === "DM") return;
          message.reply("I've sent you a DM with all my commands!");
        })
        .catch((error: any) => {
          console.warn(
            `Could not send help DM to ${message.author.tag}.\n`,
            error
          );
          message.reply(
            "it seems like I can't DM you! Do you have DMs disabled?"
          );
        });
    }

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((c: any) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(", ")}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
    if (command.usage)
      data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    message.channel.send({
		embeds: [
			new MessageEmbed()
			.setTitle("Command Help")
			.setDescription(data.toString())
		]
	});
    return;
  },
};
