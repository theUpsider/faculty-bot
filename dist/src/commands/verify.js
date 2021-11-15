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
//const Keyv = require("keyv");
var keyv_1 = __importDefault(require("keyv"));
var settings = require("../../general-settings.json");
var extensions_1 = require("../functions/extensions");
//const { ValidateEmail, logMessage } = require("../functions/extensions.js");
var MailPw = process.env.MAILPW; // prevent on demand loading
var imap_1 = __importDefault(require("imap"));
//var Imap = require("imap");
// Mail https://github.com/mscdex/node-imap
var imap;
module.exports = {
    name: "verify",
    admin: false,
    description: "verifies your email adress",
    args: true,
    guildOnly: true,
    usage: "<student mail>",
    execute: function (message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var memberToAdd, mailArg, mailFound;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id))];
                    case 1:
                        memberToAdd = _b.sent();
                        extensions_1.logMessage(message, memberToAdd + " tries to verify...");
                        try {
                            imap = new imap_1.default({
                                user: "info@akgaming.de",
                                password: MailPw,
                                host: "imap.ionos.de",
                                port: 993,
                                tls: true,
                            });
                        }
                        catch (error) {
                            console.log(error);
                        }
                        mailArg = args[0];
                        mailFound = false;
                        // check mail validity
                        if (!extensions_1.validateEmail(mailArg, message)) {
                            message.delete();
                            return [2 /*return*/];
                        }
                        // first log in to mail
                        imap.once("ready", function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    imap.openBox("INBOX", true, function (error, box) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                if (error)
                                                    console.log("Error in: ", box, " error; ", error);
                                                extensions_1.logMessage(message, "Username: " + message.author.username + " tries to verify");
                                                // search for discord name in INBOX
                                                imap.search([["HEADER", "SUBJECT", message.author.username]], function (err, results) {
                                                    console.log(results);
                                                    if (err)
                                                        throw err;
                                                    if (results === undefined ||
                                                        results === null ||
                                                        (Array.isArray(results) && results.length === 0)) {
                                                        extensions_1.logMessage(message, "Nothing to found.");
                                                        message.reply("No mail with " + message.author.username + " arrived.");
                                                        return;
                                                    }
                                                    var f = imap.fetch(results, {
                                                        bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
                                                    });
                                                    f.on("message", function (msg, seqno) {
                                                        msg.on("body", function (stream, info) {
                                                            if (info.which === "TEXT")
                                                                var buffer = "";
                                                            //write data into buffer
                                                            stream.on("data", function (chunk) {
                                                                buffer += chunk.toString("utf8");
                                                            });
                                                            //handle data
                                                            stream.once("end", function () {
                                                                return __awaiter(this, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0:
                                                                                if (!!mailFound) return [3 /*break*/, 2];
                                                                                return [4 /*yield*/, registerMember(info, buffer, message)];
                                                                            case 1:
                                                                                _a.sent();
                                                                                _a.label = 2;
                                                                            case 2:
                                                                                mailFound = true;
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                                // remove message so others dont see it
                                                try {
                                                    message.delete();
                                                }
                                                catch (error) {
                                                    extensions_1.logMessage(message, error.toString());
                                                }
                                                return [2 /*return*/];
                                            });
                                        });
                                    });
                                    return [2 /*return*/];
                                });
                            });
                        });
                        try {
                            imap.connect();
                            console.log("connected");
                        }
                        catch (error) {
                            console.log(error);
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
};
function registerMember(info, buffer, message) {
    return __awaiter(this, void 0, void 0, function () {
        function addMember(from, memberToAdd, displayName, dbverify, db_map_emailToId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            extensions_1.logMessage(message, "Granted rank student: " + memberToAdd);
                            if (!!memberToAdd.roles.cache.has(memberToAdd.guild.roles.cache.find(function (role) { return role.name === settings.roles.verified; }).id)) return [3 /*break*/, 3];
                            message.reply("You should be verified instantly. If you dont see any channels within 5 seconds, something went wrong. Someone will dig into this.");
                            //notify user in DM with steps
                            memberToAdd.send("\n\t\t\t\t\t\t\t\t\t**Herzlich Willkommen auf dem Discord " + memberToAdd.guild.name + "!**\nNachfolgend findest Du eine kurze Beschreibung, wie du dich auf unserem Server zurecht findest.\nGenerell ist jeder Studierende berechtigt alle *Kan\u00E4le* f\u00FCr jedes Fach, oder jeden Studiengang in der Fakult\u00E4t einzusehen.\nAber um das Chaos zu minimieren, dienen *Rollen* als eine Art **Filter**, um Dich vor der Flut an Kan\u00E4len zu bewahren. Deshalb kannst Du in\n**\"rollenanfrage\"** sowie **\"react-a-role\"** dein Semester ausw\u00E4hlen, bzw. abw\u00E4hlen. Danach siehst Du die F\u00E4cher, die f\u00FCr Dich relevant sind!\nJedes Semester enth\u00E4lt Kategorien, in denen Du Dich mit anderen austauschen kannst.\nEs gibt ein paar semester\u00FCbergreifende Kategorien, wie **\"/ALL\"** und **\"WICHTIGES\"**.\nDort im Kanal **\"ank\u00FCndigungen\"** kommen regelm\u00E4\u00DFige News zu hochschulweiten Veranstaltungen oder Events, sowie Erungenschaften und nice to knows.\n\nBitte lies Dir den **\"rules\"** Kanal durch, damit du wei\u00DFt wie wir auf Discord miteinander umgehen.\nSolltest Du noch Fragen haben, stell sie direkt im **\"fragen\"** channel oder kontaktiere einen **Administrator/Owner/Moderator** rechts in der Mitgliederliste.\n\nVielen Dank, dass Du dabei bist, **" + displayName + "!**\n");
                            return [4 /*yield*/, dbverify.set(from, Date.now())];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, db_map_emailToId.set(from, memberToAdd.user.id)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            try {
                                // add role
                                memberToAdd.roles.add(
                                // get role from guild chache
                                memberToAdd.guild.roles.cache.find(function (role) { return role.name === settings.roles.verified; }).id);
                            }
                            catch (UnhandledPromiseRejectionWarning) {
                                console.log("Missing access to role management.");
                                return [2 /*return*/];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var from, endmail, dbverify, db_map_emailToId, fromMailDiscordId, verifymailDate, MailUsername, memberToAdd, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(info.which !== "TEXT")) return [3 /*break*/, 11];
                    if (!imap_1.default.parseHeader(buffer).undefinedfrom[0]) {
                        extensions_1.logMessage(message, "Wrong header " + imap_1.default.parseHeader(buffer).undefinedfrom[0]);
                    }
                    from = imap_1.default.parseHeader(buffer).undefinedfrom[0];
                    endmail = from.split("@")[1].split(">")[0];
                    if (!endmail.toString().includes("stud.hs-kempten.de")) return [3 /*break*/, 10];
                    dbverify = new keyv_1.default("sqlite://verify.sqlite");
                    dbverify.on("error", function (err) {
                        return console.error("Keyv connection error:", err);
                    });
                    db_map_emailToId = new keyv_1.default("sqlite://map_emailToId.sqlite");
                    db_map_emailToId.on("error", function (err) {
                        return console.error("Keyv connection error:", err);
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, db_map_emailToId.get(from)];
                case 2:
                    fromMailDiscordId = _a.sent();
                    return [4 /*yield*/, dbverify.get(from)];
                case 3:
                    verifymailDate = _a.sent();
                    MailUsername = imap_1.default.parseHeader(buffer).subject[0].split("#")[0];
                    console.log("Mail subject: ", imap_1.default.parseHeader(buffer).subject);
                    return [4 /*yield*/, message.guild.members.fetch(message.author.id)];
                case 4:
                    memberToAdd = _a.sent();
                    if (!(MailUsername === message.author.username)) return [3 /*break*/, 6];
                    return [4 /*yield*/, addMember(from, memberToAdd, MailUsername, dbverify, db_map_emailToId)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    extensions_1.logMessage(message, message.author.username + " send another username via mail: " + MailUsername + ". Mistake or trying to let someone else in?");
                    message.reply("You tried to verify a wrong username: " + MailUsername + ". Yours is: " + message.author.username);
                    _a.label = 7;
                case 7:
                    if (!verifymailDate || verifymailDate === undefined) {
                        // if mail is registered and new discord user in mail -> impostor!
                        console.log("Newbie. First Server!");
                    }
                    else if (memberToAdd.roles.cache.has(memberToAdd.guild.roles.cache.find(function (role) { return role.name === settings.roles.verified; }).id)) {
                        console.log("already verifed user tried to send mail again: ", from);
                        message.reply("You are already verified.");
                    }
                    else if (verifymailDate || verifymailDate !== undefined) {
                        extensions_1.logMessage(message, message.author.username + " user tried to verify again, although having no role. Possibly was on other faculty before.");
                    }
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.log(error_1);
                    extensions_1.logMessage(message, "displayname not found in server. User probably sent wrong name.");
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    extensions_1.logMessage(message, message.author.username + " send an email from a non-student adress. Maybe dig into this @" + settings.roles.staffrole + ".");
                    message.reply("You sent the verification mail from a non-student email.");
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
