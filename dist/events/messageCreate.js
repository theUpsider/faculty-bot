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
var discord_js_1 = require("discord.js");
var extensions_1 = require("../functions/extensions");
var canvas_1 = __importDefault(require("canvas"));
var general_settings_json_1 = __importDefault(require("../../general-settings.json"));
var config_json_1 = __importDefault(require("../../config.json"));
module.exports = {
    event: "messageCreate",
    execute: function (client, _a, _b) {
        var _c, _d, _e, _f;
        var message = _a[0];
        var dbxp = _b.dbxp;
        return __awaiter(this, void 0, void 0, function () {
            var regex, userXP, canvas, ctx, background, attachment, lvlmsg, args, commandName, command, reply, now, timestamps, cooldownAmount, expirationTime, timeLeft;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (message.author.bot)
                            return [2 /*return*/]; // bye bye robots 
                        regex = new RegExp("^(<@!?" + client.user.id + ">|" + config_json_1.default.prefix.toLowerCase() + ")\\s*");
                        // prefix should also be mention
                        // no command! - simple message to track for XP
                        if (message.content.toLocaleLowerCase().startsWith("verify")) {
                            message.reply("You need to use ..verify");
                            // remove message so others dont see it
                            try {
                                message.delete();
                            }
                            catch (error) {
                                extensions_1.logMessage(message, error);
                            }
                        }
                        if (!!message.content.toLowerCase().startsWith(config_json_1.default.prefix)) return [3 /*break*/, 8];
                        return [4 /*yield*/, dbxp.get(message.author.id)];
                    case 1:
                        userXP = _g.sent();
                        if (!(!userXP || userXP === undefined)) return [3 /*break*/, 3];
                        console.log("no xp lmao");
                        return [4 /*yield*/, dbxp.set(message.author.id, 1)];
                    case 2:
                        _g.sent(); // set to 1 for 1 XP
                        return [2 /*return*/];
                    case 3:
                        console.log("mans got xp");
                        // if new level, post XP
                        console.log(extensions_1.toLevel(Math.trunc(userXP)) + 1, extensions_1.toLevel(Math.trunc(userXP)));
                        console.log(extensions_1.toLevel(Math.trunc(userXP)) + 1 > extensions_1.toLevel(Math.trunc(userXP)));
                        if (!(extensions_1.toLevel(Math.trunc(userXP)) + 1 > extensions_1.toLevel(Math.trunc(userXP)))) return [3 /*break*/, 6];
                        console.log("new lvl reached");
                        canvas = canvas_1.default.createCanvas(700, 250);
                        ctx = canvas.getContext("2d");
                        return [4 /*yield*/, canvas_1.default.loadImage("/home/user/github-pulls/faculty-bot/images/banner.png")];
                    case 4:
                        background = _g.sent();
                        // This uses the canvas dimensions to stretch the image onto the entire canvas
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        // Select the color of the stroke
                        ctx.strokeStyle = "#74037b";
                        // Draw a rectangle with the dimensions of the entire canvas
                        ctx.strokeRect(0, 0, canvas.width, canvas.height);
                        // Select the font size and type from one of the natively available fonts
                        ctx.font = "60px sans-serif";
                        // Slightly smaller text placed above the member's display name
                        ctx.font = extensions_1.applyText(canvas, message.author.username + " has reached");
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(message.author.username + " has reached", canvas.width / 2.4, canvas.height / 3.5);
                        // Add an exclamation point here and below
                        ctx.font = extensions_1.applyText(canvas, "LEVEL " + Math.trunc(extensions_1.toLevel(userXP) + 1));
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("LEVEL " + Math.trunc(extensions_1.toLevel(userXP) + 1), canvas.width / 2.4, canvas.height / 1.5);
                        attachment = new discord_js_1.MessageAttachment(canvas.toBuffer(), "level-up-image.png");
                        console.log();
                        console.log(message.author + " has leveled up!");
                        return [4 /*yield*/, ((_d = (_c = message.guild) === null || _c === void 0 ? void 0 : _c.channels.cache.find(function (chn) { return chn.name == general_settings_json_1.default.channels.xp; })) === null || _d === void 0 ? void 0 : _d.fetch())];
                    case 5:
                        lvlmsg = _g.sent();
                        lvlmsg.send({
                            content: "Congrats, <@" + message.author + ">!",
                            files: [attachment]
                        });
                        _g.label = 6;
                    case 6:
                        // New 1 XP for 200 chars. That means 200 chars equals to one XP Point
                        dbxp.set(message.author.id, userXP +
                            message.content.length / parseFloat(general_settings_json_1.default.settings.CharsForLevel.toString()));
                        _g.label = 7;
                    case 7: return [2 /*return*/];
                    case 8:
                        args = message.content.slice((_e = process.env.PREFIX) === null || _e === void 0 ? void 0 : _e.length).split(/ +/);
                        commandName = (_f = args.shift()) === null || _f === void 0 ? void 0 : _f.toLowerCase();
                        command = client.commands.get(commandName) ||
                            client.commands.find(function (cmd) { return cmd.aliases && cmd.aliases.includes(commandName); });
                        if (!command)
                            return [2 /*return*/];
                        //error checking
                        //guild check
                        if (command.guildOnly && !message.channel.isText()) {
                            return [2 /*return*/, message.reply("I can't execute that command inside DMs!")];
                        }
                        //args check
                        if (command.args && !args.length) {
                            reply = "You didn't provide any arguments, " + message.author + "!";
                            if (command.usage) {
                                reply += "\nThe proper usage would be: `" + process.env.PREFIX + command.name + " " + command.usage + "`";
                            }
                            return [2 /*return*/, message.channel.send(reply)];
                        }
                        // cooldown
                        if (!client.cooldowns.has(command.name)) {
                            client.cooldowns.set(command.name, new discord_js_1.Collection());
                        }
                        now = Date.now();
                        timestamps = client.cooldowns.get(command.name);
                        cooldownAmount = (command.cooldown || 1) * 1000;
                        if (timestamps.has(message.author.id)) {
                            expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                            if (now < expirationTime) {
                                timeLeft = (expirationTime - now) / 1000;
                                return [2 /*return*/, message.reply("please wait " + extensions_1.toHHMMSS(timeLeft.toFixed(1)) + " before reusing the `" + command.name + "` command.")];
                            }
                        }
                        else {
                            timestamps.set(message.author.id, now);
                            setTimeout(function () { return timestamps.delete(message.author.id); }, cooldownAmount);
                        }
                        // ----------------------------------------------------------------------------------------------------------------------------------------------
                        // Execute command
                        // ----------------------------------------------------------------------------------------------------------------------------------------------
                        try {
                            command.execute(message, args);
                        }
                        catch (error) {
                            console.error(error);
                            message.reply("there was an error trying to execute that command!");
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
};
