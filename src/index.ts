require("dotenv").config();
import { Client, Collection, MessageAttachment } from "discord.js";
//const Discord = require("discord.js");
import fetch from "node-fetch";
import Keyv from "keyv";
import sqlite from "sqlite3";
//const fs = require("fs");
import fs from "fs";
import { join } from "path";
export interface LooseObject {
  [key: string]: any;
}

const bot: LooseObject = new Client({
  intents: 32767, // we do a minor amount of tomfoolery
  partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
});

// Mail https://github.com/mscdex/node-imap

// cooldowns
bot.cooldowns = new Collection();
// commands
bot.commands = new Collection();
bot.events = new Collection();

// Key: discord ID, Value: xp value
const dbxp = new Keyv("sqlite://xp.sqlite"); // const keyv = new Keyv(); // for in-memory storage //
dbxp.on("error", (err: Error) => console.error("Keyv connection error:", err));
// Key: student-email, Value: verification date
const dbverify = new Keyv("sqlite://verify.sqlite");
dbverify.on("error", (err: Error) =>
  console.error("Keyv connection error:", err)
);
// Key: student-email, Value: discord-id
const map_emailToId = new Keyv("sqlite://map_emailToId.sqlite");
map_emailToId.on("error", (err: Error) =>
  console.error("Keyv connection error:", err)
);
// Key: channelId, Value: channelId //TODO: No key value pair needed
const dbvoicechannels = new Keyv("sqlite://voicechannels.sqlite"); // const keyv = new Keyv(); // for in-memory storage //
dbvoicechannels.on("error", (err: Error) =>
  console.error("Keyv connection error:", err)
);

//db stuff
let db = new sqlite.Database(":memory:", (err: any) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

const commandFiles = fs
  .readdirSync(join(__dirname, "commands"))
  .filter((file: any) => file); // read file with commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command); // with the key as the command name and the value as the exported module
  console.log(`Loaded command ${command.name}`);
}

const events = fs.readdirSync(join(__dirname, "events")).filter((file) => file);
for (const file of events) {
  const event = require(`./events/${file}`);
  bot.events.set(event.event, event);

  bot.on(event.event, (e1: any, e2: any) =>
    bot.events
      .get(event.event)
      .execute(bot, [e1, e2], { dbxp, dbvoicechannels, dbverify, db })
  );
  console.log(`Loaded event ${event.event}`);
}

//--------------------------------------------------
//                    BOT   LOGIN
//--------------------------------------------------
bot.login(process.env.TOKEN);

// extended functionality
// ------------------------

function attachIsImage(msgAttach: MessageAttachment) {
  var url = msgAttach.url;
  //True if this url is a png image.
  return (
    url.indexOf("png", url.length - "png".length /*or 3*/) ||
    url.indexOf("jpg", url.length - "jpg".length /*or 3*/) ||
    url.indexOf("jpeg", url.length - "jpeg".length /*or 3*/) !== -1
  );
}

async function updateBadges() {
  const channel = bot.channels.find("name", "badge");
  const { file } = await fetch("../exchange/users.json").then((response) =>
    response.json()
  );
  channel.send(file);
}
