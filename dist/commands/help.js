"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var prefix = require("../../config.json").prefix;
module.exports = {
    name: "help",
    admin: false,
    description: "List all of my commands or info about a specific command.",
    aliases: ["commands"],
    usage: "<command name>",
    cooldown: 5,
    execute: function (message, args) {
        var data = [];
        var commands = message.client.commands;
        if (!args.length) {
            data.push("Here's a list of all my commands:");
            data.push(commands.map(function (command) { return command.name; }).join(", "));
            data.push("\nYou can send `" + prefix + "help [command name]` to get info on a specific command!");
            return message.author
                .send({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setTitle("Command Help")
                        .setDescription(data.toString())
                ]
            })
                .then(function () {
                if (message.channel.type === "dm")
                    return;
                message.reply("I've sent you a DM with all my commands!");
            })
                .catch(function (error) {
                console.warn("Could not send help DM to " + message.author.tag + ".\n", error);
                message.reply("it seems like I can't DM you! Do you have DMs disabled?");
            });
        }
        var name = args[0].toLowerCase();
        var command = commands.get(name) ||
            commands.find(function (c) { return c.aliases && c.aliases.includes(name); });
        if (!command) {
            return message.reply("that's not a valid command!");
        }
        data.push("**Name:** " + command.name);
        if (command.aliases)
            data.push("**Aliases:** " + command.aliases.join(", "));
        if (command.description)
            data.push("**Description:** " + command.description);
        if (command.usage)
            data.push("**Usage:** " + prefix + command.name + " " + command.usage);
        data.push("**Cooldown:** " + (command.cooldown || 3) + " second(s)");
        message.channel.send({
            embeds: [
                new discord_js_1.MessageEmbed()
                    .setTitle("Command Help")
                    .setDescription(data.toString())
            ]
        });
        return;
    },
};
