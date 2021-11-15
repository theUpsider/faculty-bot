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
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
var discord_js_1 = require("discord.js");
var discord = require("discord.js");
var settings = require("../general-settings.json");
var log = function (message, type, content) { return __awaiter(void 0, void 0, void 0, function () {
    var logChn, logEmbed;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, ((_b = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.find(function (channel) { return channel.name == settings.channels.logs; })) === null || _b === void 0 ? void 0 : _b.fetch())];
            case 1:
                logChn = _c.sent();
                logEmbed = new discord_js_1.MessageEmbed()
                    .setTitle("**" + type + "**")
                    .setColor("GREEN")
                    .setDescription(content);
                logChn.send({
                    embeds: [logEmbed]
                });
                return [2 /*return*/];
        }
    });
}); };
exports.log = log;
/* module.exports = {
  async Log(message, Type, content) {
    let logChannel = await message.guild.channels.cache
      .find((channel) => channel.name == settings.channels.logs)
      .fetch();

    const logEmbed = new discord.MessageEmbed()
      .setTitle(`**` + Type + `**`)
      .setColor(settings.colors.green)
      .setFooter(settings.footer)
      .setDescription(content);
    logChannel.send(logEmbed);
  },
  async Error(message, Title, content) {
    let logChannel = await message.guild.channels.cache
      .find((channel) => channel.name == settings.channels.logs)
      .fetch();

    const logEmbed = new discord.MessageEmbed()
      .setTitle(`**` + Title + `**`)
      .setColor(settings.colors.red)
      .setFooter(settings.footer)
      .setDescription(content);
    logChannel.send(logEmbed);
  },
  //args: channel, Title, content
  async Embeded() {
    const args = arguments;
    const logEmbed = new discord.MessageEmbed()
      .setTitle(`**` + args[1] + `**`)
      .setColor(settings.colors.lightblue)
      .setFooter(settings.footer)
      .setDescription(args[2]);
    args[0].send(logEmbed);
  },
  // message, settings color, title, text
  async EmbededColor() {
    const args = arguments;
    const logEmbed = new discord.MessageEmbed()
      .setTitle(`**` + args[2] + `**`)
      .setColor(args[1])
      .setDescription(args[3]);
    args[0].send(logEmbed);
  },
};
 */ 
