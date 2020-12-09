const Keyv = require("keyv");
const settings = require("../general-settings.json");
const discord = require("discord.js");
const { mailpw } = require("../config.json");
const MailPw = mailpw; // prevent on demand loading
var Imap = require("imap");
// Mail https://github.com/mscdex/node-imap
var imap;

module.exports = {
  name: "verify",
  description: "verifies your email adress",
  args: true,
  guildOnly: true,
  usage: "<student mail>",
  async execute(message, args) {
    // get member from guild the message was sent in
    const memberToAdd = await message.guild.members.fetch(
      message.author.id
    );

    logMessage(message, `${memberToAdd} tries to verify...`);

    try {
      imap = new Imap({
        user: "info@akgaming.de",
        password: MailPw,
        host: "imap.ionos.de",
        port: 993,
        tls: true,
      });
    } catch (error) {
      console.log(error)
    }


    const mailArg = args[0];
    var mailFound = false;

    // check mail validity
    if (!ValidateEmail(mailArg, message)) {
      message.delete({ timeout: 1000 });
      return;
    }

    // first log in to mail
    imap.once("ready", async function () {
      imap.openBox("INBOX", true, async function (error, box) {
        if (error)
          console.log("Error in: ", box, " error; ", error);

        // search for discord name in INBOX
        imap.search(
          [["HEADER", "SUBJECT", message.author.username]],
          function (err, results) {
            console.log(results);
            if (err) throw err;
            if (results === undefined
              || results === null || (Array.isArray(results) && results.length === 0)) {
              logMessage(message, "Nothing to found.");
              message.reply(`No mail with ${message.author.username} arrived.`)
              return;
            }
            var f = imap.fetch(results, {
              bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
            });
            f.on("message", function (msg, seqno) {
              msg.on("body", function (stream, info) {
                if (info.which === "TEXT") var buffer = "";
                //write data into buffer
                stream.on("data", function (chunk) {
                  buffer += chunk.toString("utf8");
                });
                //handle data
                stream.once("end", async function () {
                  //in case there are pre existing mails, skip the process
                  if (!mailFound)
                    await registerMember(info, buffer, message);
                  mailFound = true;
                });
              });
            });
          }
        );

        // remove message so others dont see it
        try {
          message.delete({ timeout: 4000 });
        } catch (error) {
          logMessage(message, error);
        }
      });
    });


    try {

      imap.connect();
      console.log("connected")
    } catch (error) {
      console.log(error)
    }

    return;
  },
};

function ValidateEmail(mail, message) {
  if (
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      mail
    )
  ) {
    return true;
  }
  message.reply("You have entered an invalid email address!");
  logMessage(message, `${message.author.username} entered a wrong email.`);
  return false;
}

async function registerMember(info, buffer, message) {
  if (info.which !== "TEXT") {
    if (!Imap.parseHeader(buffer).undefinedfrom[0]) {
      logMessage(
        message,
        `Wrong header ${Imap.parseHeader(buffer).undefinedfrom[0]}`
      );
    }

    const from = Imap.parseHeader(buffer).undefinedfrom[0];
    const endmail = from.split(`@`)[1].split(`>`)[0];

    // is student
    if (endmail.toString().includes("stud.hs-kempten.de")) {
      // TODO if something failed, answer mail whats wrong!
      // Key: student-email, Value: verification date
      const dbverify = new Keyv("sqlite://verify.sqlite");
      dbverify.on("error", (err) =>
        console.error("Keyv connection error:", err)
      );
      // Key: student-email, Value: discord-id
      const db_map_emailToId = new Keyv("sqlite://map_emailToId.sqlite");
      db_map_emailToId.on("error", (err) =>
        console.error("Keyv connection error:", err)
      );
      // parse mail
      try {
        const fromMailDiscordId = await db_map_emailToId.get(from);
        const verifymailDate = await dbverify.get(from);
        const MailUsername = Imap.parseHeader(buffer).subject[0].split("#")[0];
        console.log(`Mail subject: `, Imap.parseHeader(buffer).subject);

        // get member from guild the message was sent in
        const memberToAdd = await message.guild.members.fetch(
          message.author.id
        );
        // TODO check if id not present! could log in as another user and use verification of real student mail
        // if mail matches the username and ID not present do verification
        if (MailUsername === message.author.username)
          await addMember(from, memberToAdd, MailUsername, dbverify, db_map_emailToId);
        else {
          logMessage(
            message,
            `${message.author.username} send another username via mail: ${MailUsername}. Mistake or trying to let someone else in?`
          );
          message.reply(`You tried to verify a wrong username: ${MailUsername}. Yours is: ${message.author.username}`)
        }

        if (!verifymailDate || verifymailDate === undefined) {
          // if mail is registered and new discord user in mail -> impostor!
          console.log("Newbie. First Server!");
        } else if (
          memberToAdd.roles.cache.has(
            memberToAdd.guild.roles.cache.find(
              (role) => role.name === settings.roles.verified
            ).id
          )
        ) {
          console.log(
            "already verifed user tried to send mail again: ",
            from
          );
          message.reply("You are already verified.");
        } else if (verifymailDate || verifymailDate !== undefined) {
          logMessage(
            message,
            `${message.author.username} user tried to verify again, although having no role. Possibly was on other faculty before.`
          );
        }
      } catch (error) {
        console.log(error);
        logMessage(
          message,
          `displayname not found in server. User probably sent wrong name.`
        );
      }
    } else {
      logMessage(
        message,
        `${message.author.username} send an email from a non-student adress. Maybe dig into this @${settings.roles.staffrole}.`
      );
      message.reply("You sent the verification mail from a non-student email.");
    }
  }

  async function addMember(from, memberToAdd, displayName, dbverify, db_map_emailToId) {

    logMessage(message, `A new member arrived: ${memberToAdd}`);

    if (
      !memberToAdd.roles.cache.has(
        memberToAdd.guild.roles.cache.find(
          (role) => role.name === settings.roles.verified
        ).id
      )
    ) {
      message.reply(
        "You should be verified instantly. If you dont see any channels within 5 seconds, something went wrong. Someone will dig into this."
      );

      //notify user in DM with steps
      memberToAdd.send(`
									**Herzlich Willkommen auf dem Discord ${memberToAdd.guild.name}!**\nNachfolgend findest Du eine kurze Beschreibung, wie du dich auf unserem Server zurecht findest.\nGenerell ist jeder Studierende berechtigt alle *Kanäle* für jedes Fach, oder jeden Studiengang in der Fakultät einzusehen.\nAber um das Chaos zu minimieren, dienen *Rollen* als eine Art **Filter**, um Dich vor der Flut an Kanälen zu bewahren. Deshalb kannst Du in\n**"rollenanfrage"** sowie **"react-a-role"** dein Semester auswählen, bzw. abwählen. Danach siehst Du die Fächer, die für Dich relevant sind!\nJedes Semester enthält Kategorien, in denen Du Dich mit anderen austauschen kannst.\nEs gibt ein paar semesterübergreifende Kategorien, wie **"/ALL"** und **"WICHTIGES"**.\nDort im Kanal **"ankündigungen"** kommen regelmäßige News zu hochschulweiten Veranstaltungen oder Events, sowie Erungenschaften und nice to knows.\n\nBitte lies Dir den **"rules"** Kanal durch, damit du weißt wie wir auf Discord miteinander umgehen.\nSolltest Du noch Fragen haben, stell sie direkt im **"fragen"** channel oder kontaktiere einen **Administrator/Owner/Moderator** rechts in der Mitgliederliste.\n\nVielen Dank, dass Du dabei bist, **${displayName}!**\n`);
      await dbverify.set(from, Date.now());
      await db_map_emailToId.set(from, memberToAdd.user.id)
    }

    try {
      // add role
      memberToAdd.roles.add(
        // get role from guild chache
        memberToAdd.guild.roles.cache.find(
          (role) => role.name === settings.roles.verified
        ).id
      );
    } catch (UnhandledPromiseRejectionWarning) {
      console.log("Missing access to role management.");
      return;
    }
  }
}
// logs a message in the logs channel of the guild it was sent in
async function logMessage(message, msg) {
  (
    await message.guild.channels.cache
      .find((channel) => channel.name == settings.channels.logs)
      .fetch()
  ).send(msg);
  console.log(msg)
}
