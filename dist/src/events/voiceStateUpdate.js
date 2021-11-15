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
var general_settings_json_1 = __importDefault(require("../../general-settings.json"));
module.exports = {
    event: "voiceStateUpdate",
    execute: function (client, _a, _b) {
        var _c, _d;
        var oldState = _a[0], newState = _a[1];
        var dbvoicechannels = _b.dbvoicechannels;
        return __awaiter(this, void 0, void 0, function () {
            var newUserChannelName, oldUserChannelName, newVC, oldChannelId_1, trackedVoiceChannelId;
            return __generator(this, function (_e) {
                try {
                    newUserChannelName = void 0;
                    if (newState.channel !== null) {
                        newUserChannelName = newState.channel.name;
                    }
                    oldUserChannelName = void 0;
                    if (oldState.channel !== null) {
                        oldUserChannelName = oldState.channel.name;
                    }
                    if (oldUserChannelName === newUserChannelName)
                        return [2 /*return*/];
                    // When a create Channel has been clicked
                    if (newUserChannelName === general_settings_json_1.default.channels.createChannel) {
                        newVC = newState.guild.channels.create("\uD83D\uDD0A " + ((_c = newState.member) === null || _c === void 0 ? void 0 : _c.user.username), {
                            type: "GUILD_VOICE",
                            permissionOverwrites: [
                                {
                                    type: "member",
                                    id: (_d = newState.member) === null || _d === void 0 ? void 0 : _d.user.id,
                                    allow: [discord_js_1.Permissions.FLAGS.MANAGE_CHANNELS],
                                }
                            ]
                        }).then(function (result) {
                            var _a;
                            // Move creator in his new channel
                            (_a = newState.member) === null || _a === void 0 ? void 0 : _a.voice.setChannel(result);
                            // Store newly created channel id for deletion
                            dbvoicechannels.set(result.id, result.id);
                        });
                        ;
                    }
                    // Check if old channel was a temporary voice channel
                    if (oldState.channel !== null) {
                        oldChannelId_1 = oldState.channel.id;
                        trackedVoiceChannelId = dbvoicechannels.get(oldChannelId_1);
                        trackedVoiceChannelId.then(function (channelId) {
                            var _a, _b;
                            // If channel is tracked as temporary voice channel
                            if (channelId != undefined) {
                                // If user was the last one in temporary channel, delete it
                                if (((_a = oldState.channel) === null || _a === void 0 ? void 0 : _a.members.size) == 0) {
                                    // delete channel
                                    (_b = oldState.channel) === null || _b === void 0 ? void 0 : _b.delete();
                                    // remove entry in tracker db
                                    dbvoicechannels.delete(oldChannelId_1);
                                }
                            }
                        });
                    }
                }
                catch (error) {
                    console.error(error);
                }
                return [2 /*return*/];
            });
        });
    }
};
