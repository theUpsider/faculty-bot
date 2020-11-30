const Keyv = require("keyv");
const settings = require("../general-settings.json");
const discord = require("discord.js");
const { mailpw } = require("../config.json");
const MailPw = mailpw; // prevent on demand loading
var Imap = require("imap");
// Mail https://github.com/mscdex/node-imap
const imap = new Imap({
  user: "info@akgaming.de",
  password: MailPw,
  host: "imap.ionos.de",
  port: 993,
  tls: true,
  tlsOptions: { servername: "imap.ionos.de" },
  keepalive: { forceNoop: true },
});

module.exports = {
  name: "verify",
  description: "verifies your email adress",
  args: true,
  guildOnly: true,
  usage: "<student mail>",
  async execute(message, args) {
    const mailArg = args[0];
    var mailFound = false;

    // check mail validity
    if (!ValidateEmail(mailArg, message)) {
      message.delete({ timeout: 5000 });
      return;
    }

    // first log in to mail
    imap.once("ready", async function () {
      imap.openBox("INBOX", true, async function (error, box) {
        console.log("Error in: ", box, " error; ", error);

        // Key: student-email, Value: verification date
        const dbverify = new Keyv("sqlite://verify.sqlite");
        dbverify.on("error", (err) =>
          console.error("Keyv connection error:", err)
        );

        // search for discord name in INBOX
        imap.search(
          [["HEADER", "SUBJECT", message.author.username]],
          function (err, results) {
            if (err) throw err;
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
                  if (!mailFound)
                    await registerMember(info, buffer, message, mailFound);
                  mailFound = true;
                });
              });
            });
          }
        );
        try {
          message.delete({ timeout: 5000 });
        } catch (error) {
          console.log(error);
        }
      });
    });
    imap.connect();
    // reply
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
  return false;
}

async function registerMember(info, buffer, message, mailFound) {
  //in case there are pre existing mails, skip the process

  if (info.which !== "TEXT") {
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
      const verifymailDate = await dbverify.get(from);
      try {
        const displayName = Imap.parseHeader(buffer).subject[0].split("#")[0];
        console.log(`Mail subject: `, Imap.parseHeader(buffer).subject);

        // get member from guild the message was sent in
        const memberToAdd = await message.guild.members.fetch(
          message.author.id
        );

        // if mail not registered, do verification
        if (!verifymailDate || verifymailDate === undefined) {
          await addMember(from, memberToAdd, displayName, dbverify);

          // if mail is registered and new discord user in mail -> impostor!
        } else if (
          memberToAdd.roles.cache.has(
            memberToAdd.guild.roles.cache.find(
              (role) => role.name === settings.roles.verified
            ).id
          )
        ) {
          console.log(
            "already verifed user tried to send mail again: ",
            from,
            "\npossibly a impostor."
          );
          message.reply("You are already verified.");
        } else {
          console.log(
            "user tried to verify again, although having no role. Possibly was on other faculty before: ",
            from
          );
          await addMember(from, memberToAdd, displayName, dbverify);
        }
      } catch (error) {
        console.log(error);
        console.log(
          "displayname not found in server. User probably sent wrong name."
        );
      }
    } else {
      console.log(
        "email without verification arrived.\nSender: ",
        from,
        "\npossibly a professor."
      );
    }
  }

  async function addMember(from, memberToAdd, displayName, dbverify) {
    // if(memberToAdd.guild.members.cache.find((member) => member.id ===))
    console.log("\n****************\nNew Member: ", from);

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

    if (
      !memberToAdd.roles.cache.has(
        memberToAdd.guild.roles.cache.find(
          (role) => role.name === settings.roles.verified
        ).id
      )
    ) {
      // delete message
      message.reply(
        "You should be verified instantly. If you dont see any channels within 5 seconds, something went wrong. Someone will dig into this."
      );

      //notify user in DM with steps
      //TODO make channels generic
      memberToAdd.send(`
									**Herzlich Willkommen auf dem Discord ${memberToAdd.guild.name}!**\nNachfolgend findest Du eine kurze Beschreibung, wie du dich auf unserem Server zurecht findest.\nGenerell ist jeder Studierende berechtigt alle *Kanäle* für jedes Fach, oder jeden Studiengang in der Fakultät einzusehen.\nAber um das Chaos zu minimieren, dienen *Rollen* als eine Art **Filter**, um Dich vor der Flut an Kanälen zu bewahren. Deshalb kannst Du in\n**"rollenanfrage"** sowie **"react-a-role"** dein Semester auswählen, bzw. abwählen. Danach siehst Du die Fächer, die für Dich relevant sind!\nJedes Semester enthält Kategorien, in denen Du Dich mit anderen austauschen kannst.\nEs gibt ein paar semesterübergreifende Kategorien, wie **"/ALL"** und **"WICHTIGES"**.\nDort im Kanal **"ankündigungen"** kommen regelmäßige News zu hochschulweiten Veranstaltungen oder Events, sowie Erungenschaften und nice to knows.\n\nBitte lies Dir den **"rules"** Kanal durch, damit du weißt wie wir auf Discord miteinander umgehen.\nSolltest Du noch Fragen haben, stell sie direkt im **"fragen"** channel oder kontaktiere einen **Administrator/Owner/Moderator** rechts in der Mitgliederliste.\n\nVielen Dank, dass Du dabei bist, **${displayName}!**\n`);
      await dbverify.set(from, Date.now());
    }
  }
}
