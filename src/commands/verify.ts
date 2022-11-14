import { Message, Role } from "discord.js";

//const Keyv = require("keyv");
import Keyv from "keyv";
const settings = require("../../general-settings.json")
import { validateEmail, logMessage } from "../functions/extensions"
//const { ValidateEmail, logMessage } = require("../functions/extensions.js");
const MailPw = process.env.MAILPW as string; // prevent on demand loading
import Imap from "imap"
//var Imap = require("imap");
// Mail https://github.com/mscdex/node-imap
var imaps = require('imap-simple');
const _ = require('lodash');


module.exports = {
  name: "verify",
  admin: false,
  description: "verifies your email adress",
  args: false,
  guildOnly: true,
  usage: "",
  async execute(message: Message) {
    // get member from guild the message was sent in
    const memberToAdd = await message.guild?.members.fetch(message.author.id);

    logMessage(message, `${memberToAdd?.user.tag} tries to verify...`);

    var mailFound = false;

    var config = {
      imap: {
        user: process.env.MAILUSER as string,
        password: MailPw,
        host: "imap.ionos.de",
        port: 993,
        tls: true,
        authTimeout: 3000
      }
    };
    imaps.connect(config).then(function (connection) {
      return connection.openBox('INBOX').then(function () {
        var searchCriteria = [["HEADER", "SUBJECT", message.author.tag]];
        var fetchOptions = {
          bodies: ['HEADER', 'TEXT'],
        };
        return connection.search(searchCriteria, fetchOptions).then(function (messages) {
          messages.forEach(async function (item) {

            var all = _.find(item.parts, { "which": "HEADER" })
            var subject = all.body.subject[0] ?? undefined;
            var fromEmail = all.body['return-path'][0];

            //in case there are pre existing mails, skip the process
            const mail = fromEmail.split(`<`)[1].split(`>`)[0];
            if (!mailFound) await registerMember(subject, mail, message);
            mailFound = true;
          });
        });
      });
    });
    return;
  },
};

async function registerMember(subject: string, mail: string, message: any) {
  const endmail = mail.split(`@`)[1];

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
      const memberToAdd = await message.guild.members.fetch(
        message.author.id
      );
      const verifymailDate = await dbverify.get(mail);
      console.info(`Mail subject: `, subject);

      const fromMailDiscordId = await db_map_emailToId.get(mail);
      if (message.author.id !== fromMailDiscordId) {
        logMessage(message, `@&${memberToAdd.guild.roles.cache.find(
          (role: Role) => role.name === settings.roles.staffrole
        ).id}> User tries to let someone else in! This is not allowed. Old verify date is ${verifymailDate}`);
        return;
      }

      // if mail matches the username and ID not present do verification
      if (subject === message.author.username + "#" + message.author.discriminator)
        await addMember(
          message,
          mail,
          memberToAdd,
          subject,
          dbverify,
          db_map_emailToId
        );
      else {
        logMessage(
          message,
          `"${message.author.username}" with mail subject "${subject}" send another username via mail: ${mail}. Mistake or trying to let someone else in?`
        );
        message.reply(
          `You tried to verify a wrong username: ${subject}. Yours is: ${message.author.username}`
        );
      }

      if (!verifymailDate || verifymailDate === undefined) {
        // if mail is registered and new discord user in mail -> impostor!
        console.log("Newbie. First Server!");
      } else if (
        memberToAdd.roles.cache.has(
          memberToAdd.guild.roles.cache.find(
            (role: Role) => role.name === settings.roles.verified
          ).id
        )
      ) {
        console.log(`already verifed user ${message.author.username} tried to send mail again: `, mail);
        message.reply("You are already verified.");
      } else if (verifymailDate || verifymailDate !== undefined) {
        logMessage(
          message,
          `${message.author.username} user tried to verify again with mail: "${mail}", although having no role. Possibly was on other faculty before.`
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

async function addMember(
  message: any,
  from: any,
  memberToAdd: any,
  displayName: any,
  dbverify: Keyv,
  db_map_emailToId: Keyv
) {
  logMessage(message, `Granted rank student: ${memberToAdd}`);

  if (
    !memberToAdd.roles.cache.has(
      memberToAdd.guild.roles.cache.find(
        (role: Role) => role.name === settings.roles.verified
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
    await db_map_emailToId.set(from, memberToAdd.user.id);
  }

  try {
    // add role
    memberToAdd.roles.add(
      // get role from guild chache
      memberToAdd.guild.roles.cache.find(
        (role: Role) => role.name === settings.roles.verified
      ).id
    );
  } catch (UnhandledPromiseRejectionWarning) {
    console.log("Missing access to role management.");
    return;
  }
}

