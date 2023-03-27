require("dotenv").config();
import { Attachment, Client, ClientOptions, Collection, GatewayDispatchEvents, GatewayMessageEventExtraFields } from "discord.js";
//const Discord = require("discord.js");
import fetch from "node-fetch";
import Keyv from "keyv";
import sqlite from "sqlite3";
//const fs = require("fs");
import fs from "fs";
import { join } from "path";
import { CommandDefinition, register_commands } from "./utils";


export class FacultyManager extends Client {

  cooldowns: Collection<string, Collection<string, number>>;
  commands: Collection<string, CommandDefinition>;
  events: Collection<string, any>;
  dbxp: Keyv;
  dbverify: Keyv;
  map_emailToId: Keyv;
  dbvoicechannels: Keyv;
  db: sqlite.Database;
  client: this;


  constructor(options: ClientOptions) {
    super(options);

    this.cooldowns = new Collection();
    this.commands = new Collection<string, CommandDefinition>();
    this.events = new Collection();
    this.dbxp = new Keyv("sqlite://xp.sqlite").on("error", (err: Error) => console.error("Keyv connection error:", err));
    this.dbverify = new Keyv("sqlite://verify.sqlite").on("error", (err: Error) => console.error("Keyv connection error:", err));
    this.map_emailToId = new Keyv("sqlite://map_emailToId.sqlite").on("error", (err: Error) => console.error("Keyv connection error:", err));
    this.dbvoicechannels = new Keyv("sqlite://voicechannels.sqlite").on("error", (err: Error) => console.error("Keyv connection error:", err));

    this.db = new sqlite.Database(":memory:", (err: any) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Connected to the in-memory SQlite database.");
    });

  }

  attachIsImage(msgAttach: Attachment) {
    let url = msgAttach.url;
    //True if this url is a png image.
    return (
      url.indexOf("png", url.length - "png".length /*or 3*/) ||
      url.indexOf("jpg", url.length - "jpg".length /*or 3*/) ||
      url.indexOf("jpeg", url.length - "jpeg".length /*or 3*/) !== -1
    );
  }

  // init commands 
  async init() {
    // commands
    const commandFiles = fs.readdirSync(join(__dirname, "commands")).filter((file: any) => file); // read file with commands
    for (const file of commandFiles) {
      const command: CommandDefinition = (await import(`./commands/${file}`)).default;
      if (command.slashSetup)
         this.commands.set(command.slashSetup?.name, command);
    }
  }

  // init events
  async initEvents() {
    const eventFiles = fs.readdirSync(join(__dirname, "events")).filter((file: any) => file);
    for (const file of eventFiles) {
      const event = (await import(`./events/${file}`)).default;
      this.events.set(event.event, event);
      this.on(event.event, (e1: any, e2: any) => {
          console.log("event: " + event.event);
          console.log("e1: " + e1);
          console.log("e2: " + e2);
          this.events.get(event.event).execute(this, [e1, e2]);
      });
    }
  }
  
  async registerCommands() {
    const commands = this.commands.map((command) => command);
    await register_commands(commands, this);
  }


  
}


async function main() {
  const client = new FacultyManager({
    intents: 32767, // we do a little 
  })

  await client.init();
  await client.initEvents();
  await client.registerCommands();


  client.login(process.env.TOKEN);
}

main().catch((err) => {
  console.error(err);
});

// extended functionality
// ------------------------

function attachIsImage(msgAttach: Attachment) {
  const url = msgAttach.url;
  //True if this url is a png image.
  return (
    url.indexOf("png", url.length - "png".length /*or 3*/) ||
    url.indexOf("jpg", url.length - "jpg".length /*or 3*/) ||
    url.indexOf("jpeg", url.length - "jpeg".length /*or 3*/) !== -1
  );
}
