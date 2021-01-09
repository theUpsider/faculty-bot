const settings = require("../general-settings.json");
const { ValidateEmail } = require("./functions/extensions.js");

module.exports = {
  name: "getbymail",
  admin: true,
  description: "gets the verificationdate and discordname",
  args: true,
  usage: "<user ID> or <E-Mail>",
  guildOnly: false,
  aliases: ["getbyemail"],
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

    // get member from guild the message was sent in
    let memerSearched;
    try {
      memerSearched = await message.guild.members.fetch(args[0]).id;
    } catch (error) {
      return message.reply(`No member found.`);
    }
    if (!ValidateEmail(args[0]) && !memerSearched)
      return message.reply(`No member found or email invalid.`);

    //DOING: check databased for email or member, depending on what args have been given

    // Key: student-email, Value: verification date
    const dbverify = new Keyv("sqlite://verify.sqlite");
    dbverify.on("error", (err) => console.error("Keyv connection error:", err));
    // Key: student-email, Value: discord-id
    const db_map_emailToId = new Keyv("sqlite://map_emailToId.sqlite");
    db_map_emailToId.on("error", (err) =>
      console.error("Keyv connection error:", err)
    );

    const channel = await message.guild.channels.cache
      .find((channel) => channel.name == args[0])
      .fetch();
    channel.send(args.join(" "));

    return;
  },
};
