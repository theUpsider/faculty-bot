"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var discord_js_1 = require("discord.js");
//const Discord = require("discord.js");
var node_fetch_1 = __importDefault(require("node-fetch"));
var keyv_1 = __importDefault(require("keyv"));
var sqlite3_1 = __importDefault(require("sqlite3"));
//const { prefix, token, mailpw } = require("./config.json");
var MailPw = process.env.MAILPW; // prevent on demand loading
//const fs = require("fs");
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var bot = new discord_js_1.Client({
    intents: 32767,
    partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
});
// Mail https://github.com/mscdex/node-imap
// cooldowns
bot.cooldowns = new discord_js_1.Collection();
// commands
bot.commands = new discord_js_1.Collection();
bot.events = new discord_js_1.Collection();
// Key: discord ID, Value: xp value
var dbxp = new keyv_1.default("sqlite://xp.sqlite"); // const keyv = new Keyv(); // for in-memory storage //
dbxp.on("error", function (err) { return console.error("Keyv connection error:", err); });
// Key: student-email, Value: verification date
var dbverify = new keyv_1.default("sqlite://verify.sqlite");
dbverify.on("error", function (err) { return console.error("Keyv connection error:", err); });
// Key: student-email, Value: discord-id
var map_emailToId = new keyv_1.default("sqlite://map_emailToId.sqlite");
map_emailToId.on("error", function (err) {
    return console.error("Keyv connection error:", err);
});
// Key: channelId, Value: channelId //TODO: No key value pair needed
var dbvoicechannels = new keyv_1.default("sqlite://voicechannels.sqlite"); // const keyv = new Keyv(); // for in-memory storage //
dbvoicechannels.on("error", function (err) { return console.error("Keyv connection error:", err); });
//db stuff
var db = new sqlite3_1.default.Database(":memory:", function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
});
console.log(__dirname);
var commandFiles = fs_1.default
    .readdirSync(path_1.join(__dirname, 'commands'))
    .filter(function (file) { return file; }); // read file with commands
for (var _i = 0, commandFiles_1 = commandFiles; _i < commandFiles_1.length; _i++) {
    var file = commandFiles_1[_i];
    var command = require("./commands/" + file);
    bot.commands.set(command.name, command); // with the key as the command name and the value as the exported module
}
var events = fs_1.default.readdirSync(path_1.join(__dirname, 'events')).filter(function (file) { return file; });
var _loop_1 = function (file) {
    var event_1 = require("./events/" + file);
    bot.events.set(event_1.event, event_1);
    // client.on(event.event, e => client.events.get(event.event).execute(client, e, Ticket, Setting));
    bot.on(event_1.event, function (e1, e2) { return bot.events.get(event_1.event).execute(bot, [e1, e2], { dbxp: dbxp, dbvoicechannels: dbvoicechannels, dbverify: dbverify, db: db }); });
    console.log("Loaded event " + event_1.event);
};
for (var _a = 0, events_1 = events; _a < events_1.length; _a++) {
    var file = events_1[_a];
    _loop_1(file);
}
//--------------------------------------------------
//                    BOT   LOGIN
//--------------------------------------------------
bot.login(process.env.TOKEN);
bot.on("ready", function () {
    /*   console.info(`Logged in as ${bot.user.tag}!`);
      bot.user.setActivity("use ..help", { type: "PLAYING" });
    
      // const options = {
      //   density: 400,
      //   quality: 100,
      //   saveFilename: "mensaplan",
      //   savePath: "./",
      //   format: "png",
      //   width: 768,
      //   height: 512
      // };
    
      // mealplan check
      var minutes = settings.settings.mealplancheck, meal_check_interval = minutes * 60 * 1000;
      // if feature is activated
      if (settings.settings.postMealplan) {
        console.log("Mensaplan activated")
        setInterval(async function () {
          isWeekdayNow = new Date().getDay() == settings.settings.mealplandaycheck ? 1 : 0
          if (isWeekdayNow) {
            // if after x hours on the new day
            if (new Date().getHours() >= settings.settings.mealplanhourscheck) {
              let channel = bot.channels.cache.get(settings.channels.mealPlan)
              // check if already posted today
              // if not been posted today
              channel.messages.fetch({ limit: 1 }).then(messages => {
                let lastMessage = messages.first();
                if (new Date(lastMessage.createdTimestamp).getDate() != new Date().getDate()) {
                  if (channel != undefined) {
                    download(settings.settings.mealplan, settings.settings.mealplanpdfpath).then(download => {
    
                      console.log("Mensaplan downloaded");
                      // ConvertedFile
                      const storeAsImage = fromPath(settings.settings.mealplanpdfpath, settings.settings.mealplansettings);
                      const pageToConvertAsImage = 1;
    
                      storeAsImage(pageToConvertAsImage).then((resolve) => {
                        console.log("Mensaplan converted");
    
                        channel.send(`<@&${settings.roles.mealplannotify}>`, { files: [resolve.path] });
                        channel.send("En Guada")
                        return resolve;
                      });
    
                    })
                  }
                }
              }).catch(console.error);
            }
          }
        }, meal_check_interval);
      }
    
      // after startup, check if any voice channel are left over in the db (after a crash for example)
      // TODO: */
});
//--------------------------------------------------
//                  MESSAGE
//--------------------------------------------------
/* bot.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // no command! - simple message to track for XP
  if (message.content.toLocaleLowerCase().startsWith(`verify`)) {
    message.reply("You need to use ..verify");
    // remove message so others dont see it
    try {
      message.delete({ timeout: 4000 });
    } catch (error) {
      logMessage(message, error);
    }
  }


  if (!message.content.startsWith(prefix) && message.channel.type == "text") {
    // handle ads
    // if (message.channel.name == settings.channels.ads) {
    //   // TODO extend to database + calculation for the case the bot crashes
    //   var deletionDate = Date.now();
    //   deletionDate.setMilliseconds(
    //     deletionDate.getMilliseconds() + settings.settings.adstimeout
    //   );
    //   console.info(`ad posted. Will be deleted on ${deletionDate}`);
    //   message.delete({ timeout: settings.settings.adstimeout }); // 4 weeks
    // }


    const userXP = await dbxp.get(message.author.id);

    // user xp
    if (!userXP || userXP === undefined) {
      await dbxp.set(message.author.id, 1); // set to 1 for 1 XP
      return;
    } else {
      // if new level, post XP
      if (toLevel(Math.trunc(userXP) + 1) > toLevel(Math.trunc(userXP))) {
        // send level xp to xp channel
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext("2d");

        // Since the image takes time to load, you should await it
        const background = await Canvas.loadImage("./images/banner.png");
        // This uses the canvas dimensions to stretch the image onto the entire canvas
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Select the color of the stroke
        ctx.strokeStyle = "#74037b";
        // Draw a rectangle with the dimensions of the entire canvas
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Select the font size and type from one of the natively available fonts
        ctx.font = "60px sans-serif";

        // Slightly smaller text placed above the member's display name
        ctx.font = applyText(canvas, `${message.author.username} has reached`);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          `${message.author.username} has reached`,
          canvas.width / 2.4,
          canvas.height / 3.5
        );

        // Add an exclamation point here and below
        ctx.font = applyText(
          canvas,
          `LEVEL ${Math.trunc(toLevel(userXP + 1))}`
        );
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          `LEVEL ${Math.trunc(toLevel(userXP + 1))}`,
          canvas.width / 2.4,
          canvas.height / 1.5
        );

        // Use helpful Attachment class structure to process the file for you
        const attachment = new Discord.MessageAttachment(
          canvas.toBuffer(),
          "level-up-image.png"
        );
        (
          await message.guild.channels.cache
            .find((channel) => channel.name == settings.channels.xp)
            .fetch()
        ).send(`Congrats, ${message.author}!`, attachment);
      }

      // New 1 XP for 200 chars. That means 200 chars equals to one XP Point
      dbxp.set(
        message.author.id,
        userXP +
        message.content.length / parseFloat(settings.settings.CharsForLevel)
      );
    }

    return;
  }

  //filter args
  const args = message.content.slice(prefix.length).split(/ +/); //filter args
  const commandName = args.shift().toLowerCase();

  //command checking aliases
  const command =
    bot.commands.get(commandName) ||
    bot.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  //error checking
  //guild check
  if (command.guildOnly && message.channel.type !== "text") {
    return message.reply("I can't execute that command inside DMs!");
  }

  //args check
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }

  // cooldown
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1).toHHMMSS()} before reusing the \`${command.name
        }\` command.`
      );
    }
  } else {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  // ----------------------------------------------------------------------------------------------------------------------------------------------
  // Execute command
  // ----------------------------------------------------------------------------------------------------------------------------------------------
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
}); */
// ----------------------------------------------------------------------------------------------------------------------------------------------
// User Join
// ----------------------------------------------------------------------------------------------------------------------------------------------
bot.on("guildMemberAdd", function (member) {
    // const embeded = new Discord.MessageEmbed()
    // 	.setColor(settings.colors.blue)
    // 	.setTitle(`A new user has joined`)
    // 	.setDescription(`Welcome **` + member.user.username + `** to the tournament server! Before doing anything else read <#${settings.channels.information}> and <#${settings.channels.rules}>. Any further questions should be directed towards our staff. Enjoy your stay!`)
    // 	.setFooter(settings.footer);
    // try {
    // 	member.guild.channels.resolve(settings.channels.greetings).send(embeded);
    // } catch (error) {
    // 	console.log(error)
    // }
});
// ----------------------------------------------------------------------------------------------------------------------------------------------
// User Voice channel interaction
// ----------------------------------------------------------------------------------------------------------------------------------------------
/* bot.on("voiceStateUpdate", (oldState, newState) => {
  try {
    let newUserChannelName = null;
    if (newState.channel !== null) {
      newUserChannelName = newState.channel.name;
    }
    let oldUserChannelName = null;
    if (oldState.channel !== null) {
      oldUserChannelName = oldState.channel.name;
    }
    if (oldUserChannelName === newUserChannelName) return;

    // When a create Channel has been clicked
    if (newUserChannelName === settings.channels.createChannel) {
      newChannel = newState.guild.channels
        .create("🔊 " + newState.member.displayName, {
          type: "voice",
          parent: newState.channel.parent,
          permissionOverwrites: [ // Allow creator to modify this specific channel
            {
              id: newState.member.id,
              allow: [Discord.Permissions.FLAGS.MANAGE_CHANNELS],
           },
         ],
        })
        .then(function (result) {
          // Move creator in his new channel
          newState.member.voice.setChannel(result);
          // Store newly created channel id for deletion
          dbvoicechannels.set(result.id, result.id);
        });
    }

    // Check if old channel was a temporary voice channel
    if (oldState.channel !== null) {
      let oldChannelId = oldState.channel.id;
      let trackedVoiceChannelId = dbvoicechannels.get(oldChannelId);
      trackedVoiceChannelId.then(function(channelId)
      {
        // If channel is tracked as temporary voice channel
        if (channelId != undefined) {
          // If user was the last one in temporary channel, delete it
          if(oldState.channel.members.size == 0) {
            // delete channel
            oldState.channel.delete();
            // remove entry in tracker db
            dbvoicechannels.delete(oldChannelId);
          }
        }
      });
    }
    
  } catch (error) {
    console.error(error);
  }
}); */
// make sure voice channels are tagged with 🔊
/* bot.on("channelUpdate", (oldChannel, newChannel) => {
  if(newChannel == null)
    return;

  // Is a user created channel
  let isTracked = dbvoicechannels.get(newChannel.id);
  isTracked.then(function(channelId)
  {
    // If channel is tracked as temporary voice channel
    if (channelId != undefined) {
      if(!newChannel.name.startsWith("🔊")) {
        newChannel.setName("🔊 " + newChannel.name);
      }
    }
  });
}); */
// extended functionality
// ------------------------
function attachIsImage(msgAttach) {
    var url = msgAttach.url;
    //True if this url is a png image.
    return (url.indexOf("png", url.length - "png".length /*or 3*/) ||
        url.indexOf("jpg", url.length - "jpg".length /*or 3*/) ||
        url.indexOf("jpeg", url.length - "jpeg".length /*or 3*/) !== -1);
}
function updateBadges() {
    return __awaiter(this, void 0, void 0, function () {
        var channel, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    channel = bot.channels.find("name", "badge");
                    return [4 /*yield*/, node_fetch_1.default("../exchange/users.json").then(function (response) {
                            return response.json();
                        })];
                case 1:
                    file = (_a.sent()).file;
                    channel.send(file);
                    return [2 /*return*/];
            }
        });
    });
}
