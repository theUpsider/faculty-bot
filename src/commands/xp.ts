import { Message, SlashCommandBuilder } from "discord.js";

import Keyv from "keyv";
import defineCommand from "../utils";
import { toLevel } from "../functions/extensions";


export default defineCommand({
  slashSetup: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("displays your XP and Level"),
  run: async (client, ctx, args): Promise<void> => {
    //db1
    // Key: iD, Value: XP
    const dbxp = client.dbxp;
    
    const userXP = await dbxp.get(ctx.member.user.id); // is weird but works that way

    if (!userXP || userXP === undefined) {
      await dbxp.set(ctx.member.user.id, 1); // set to 1 for 1 XP
      ctx.reply(`you can now start to earn xp!`);
      return;
    } else {
      ctx.reply(
        `you have ${Math.trunc(userXP)} XP. This equals to ${toLevel(
          Math.trunc(userXP)
        )} Levels.`
      );
    }
  }
});

