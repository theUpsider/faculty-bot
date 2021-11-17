import { Message } from "discord.js";

import Keyv from "keyv";
import settings from "../../general-settings.json"
import { toLevel } from "../functions/extensions"

module.exports = {
  name: "xp",
  admin: false,
  description: "displays your XP and Level",
  args: false,
  guildOnly: true,
  aliases: ["level", "exp", "progress"],
  async execute(message: Message, args: string[]) {
    //db1
    // Key: iD, Value: XP
    const dbxp = new Keyv("sqlite://xp.sqlite");
    dbxp.on("error", (err: any) => console.error("Keyv connection error:", err));

    const userXP = await dbxp.get(message.author.id); // is weird but works that way

    if (!userXP || userXP === undefined) {
      await dbxp.set(message.author.id, 1); // set to 1 for 1 XP
      message.reply(`you can now start to earn xp!`);
      return;
    } else {
      message.reply(
        `you have ${Math.trunc(userXP)} XP. This equals to ${toLevel(Math.trunc(userXP))} Levels.`
      );
    }
    return;
  },
};
