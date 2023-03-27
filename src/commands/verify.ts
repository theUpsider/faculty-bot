import { Role, Message, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import defineCommand from "../utils";

//const Keyv = require("keyv");
import Keyv from "keyv";
import settings from "../../general-settings.json"
import { validateEmail, logMessage } from "../functions/extensions"
const MailPw = process.env.MAILPW as string; // prevent on demand loading
import Imap from "imap"
import imaps from "imap-simple";
import { FacultyManager } from "index";
const _ = require('lodash');

export default defineCommand({
  slashSetup: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("verifies your email adress")
    .addStringOption(option => option.setName("email").setDescription("The email to verify").setRequired(true))
    // default permissions for the command is everyone
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false),
  run: async (client, ctx, args): Promise<void> => {
    // discriminate if the command was run via slash or prefix
    const email = (ctx as CommandInteraction).options.get("email", true).value?.toString();

    if (!validateEmail(email)) {
      ctx.reply({ content: `:x: ${email} is not a valid email adress`, ephemeral: true });
      return;
    }

    const member = ctx.member;

    const role = ctx.guild?.roles.cache.find(role => role.name === settings.roles.verified) as Role;

    if (member?.roles.toString().includes(role.id)) { // retard overload
      ctx.reply({ content: `:x: ${member.user.username} is already verified`, ephemeral: true });
      return;
    }

    let mailFound = false;
    const config = {
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
        const searchCriteria = [["HEADER", "SUBJECT", ctx.member.user.username]];
        const fetchOptions = {
          bodies: ['HEADER', 'TEXT'],
        };
        return connection.search(searchCriteria, fetchOptions).then(function (messages) {
          messages.forEach(async function (item) {

            const all = _.find(item.parts, { "which": "HEADER" })
            const subject = all.body.subject[0] ?? undefined;
            const fromEmail = all.body['return-path'][0];

            //in case there are pre existing mails, skip the process
            const mail = fromEmail.split(`<`)[1].split(`>`)[0];
            if (!mailFound) await registerMember(client, mail, member as GuildMember, subject);
            mailFound = true;
          });
        });
      });
    });

    const embed = new EmbedBuilder()

    ctx.reply({ embeds: [embed] });
  }
});

async function registerMember(client: FacultyManager, mail: string, member: GuildMember, subject?: string) {
  const endmail = mail.split(`@`)[1];

  // is student
  if (endmail.toString().includes("stud.hs-kempten.de")) {
    // TODO if something failed, answer mail whats wrong!
    // Key: student-email, Value: verification date
    const dbverify = client.dbverify;
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
      const memberToAdd = await member.guild.members.fetch(
        member.id
      );
      const verifymailDate = await dbverify.get(mail);
      console.info(`Mail subject: `, subject);

      const fromMailDiscordId = await db_map_emailToId.get(mail);

      if (fromMailDiscordId) {
        await memberToAdd.send(
          `:x: You already verified with this email adress!`
        );
        return;
      }

      if (verifymailDate) {
        await memberToAdd.send(
          `:x: You already verified with this email adress!`
        );
        return;
      }

      // add role
      const role = member.guild.roles.cache.find(
        (role) => role.name === settings.roles.verified
      ) as Role;
      await memberToAdd.roles.add(role);
      // save to db
      await dbverify.set(mail, new Date());
      await db_map_emailToId.set(mail, memberToAdd.id);
      // send success message
      await memberToAdd.send(
        `:white_check_mark: You successfully verified with the email adress ${mail}`
      );
    } catch (err) {
      console.error(err);
      await member.send(
        `:x: Something went wrong while verifying your email adress!`
      );
    }
  } else {
    await member.send(
      `:x: You can only verify with a student email adress!`
    );
  }
}


async function _registerMember(subject: string, mail: string, message: any) {
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

      if (!verifymailDate || verifymailDate === undefined) {
        // if mail is registered and new discord user in mail -> impostor!
        console.log("Newbie. First Server!");
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
        message.reply("You are have been already on another server. Please contact a staff member.");
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

