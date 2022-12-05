const settings = require("../../general-settings.json")
import { validateEmail } from "../functions/extensions"
import { Message, TextChannel } from "discord.js";
import Keyv from "keyv";

module.exports = {
  name: "getbymail",
  admin: true,
  description: "gets the verificationdate and discordname",
  args: true,
  usage: "<E-Mail>",
  guildOnly: false,
  aliases: ["getbyemail"],
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

    // get member from guild the message was sent in
    // let memberSearched;
    // try {
    //   memberSearched = await (await message.guild?.members.fetch(args[0]))?.id; //message.guild?.members.fetch(args[0])?.id;
    // } catch (error) {
    //   return message.reply(`No member found.`);
    // }
    // if args[0] is has @ in it, it is an email
    var discordId;
    var isMailAsArg = false;
    if (args[0].includes("@")) {
      if (!validateEmail(args[0], message))
        return message.reply(`No member found or email invalid.`);
      // Key: student-email, Value: discord-id
      const db_map_emailToId = new Keyv("sqlite://map_emailToId.sqlite");
      db_map_emailToId.on("error", (err) =>
        console.error("Keyv connection error:", err)
      );
      discordId = await db_map_emailToId.get(args[0]);
      isMailAsArg = true;
    } else
      discordId = args[0];


    //DOING: check databased for email or member, depending on what args have been given

    // Key: student-email, Value: verification date
    const dbverify = new Keyv("sqlite://verify.sqlite");
    dbverify.on("error", (err) => console.error("Keyv connection error:", err));
    const verifymailDate = await dbverify.get(args[0]);
    message.reply(`${new Date(verifymailDate)} string is: ${verifymailDate}`)

    return;
  },
};
