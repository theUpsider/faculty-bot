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
var general_settings_json_1 = __importDefault(require("../../general-settings.json"));
var extensions_1 = require("../functions/extensions");
var pdf2pic_1 = require("pdf2pic");
module.exports = {
    event: "ready",
    execute: function (client) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var minutes, meal_check_interval;
            return __generator(this, function (_d) {
                console.log(((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag) + " is ready!");
                (_b = client.user) === null || _b === void 0 ? void 0 : _b.setPresence({
                    activities: [{
                            name: "..help",
                            type: "LISTENING"
                        }]
                });
                console.info("Logged in as " + ((_c = client.user) === null || _c === void 0 ? void 0 : _c.tag) + "!");
                minutes = general_settings_json_1.default.settings.mealplancheck, meal_check_interval = minutes * 60 * 1000;
                // if feature is activated
                if (general_settings_json_1.default.settings.postMealplan) {
                    console.log("Mensaplan activated");
                    setInterval(function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var isWeekdayNow, channel_1;
                            return __generator(this, function (_a) {
                                isWeekdayNow = new Date().getDay() == general_settings_json_1.default.settings.mealplandaycheck ? 1 : 0;
                                if (isWeekdayNow) {
                                    // if after x hours on the new day
                                    if (new Date().getHours() >= general_settings_json_1.default.settings.mealplanhourscheck) {
                                        channel_1 = client.channels.cache.get(general_settings_json_1.default.channels.mealPlan);
                                        // check if already posted today
                                        // get last message from channel
                                        // if not been posted today
                                        channel_1.messages.fetch({ limit: 1 }).then(function (messages) {
                                            var _a;
                                            var lastMessage = (_a = channel_1.lastMessage) === null || _a === void 0 ? void 0 : _a.createdTimestamp;
                                            if (new Date(lastMessage).getDate() != new Date().getDate()) {
                                                if (channel_1 != undefined) {
                                                    extensions_1.download(general_settings_json_1.default.settings.mealplan, general_settings_json_1.default.settings.mealplanpdfpath).then(function (download) {
                                                        console.log("Mensaplan downloaded");
                                                        // ConvertedFile
                                                        var storeAsImage = pdf2pic_1.fromPath(general_settings_json_1.default.settings.mealplanpdfpath, general_settings_json_1.default.settings.mealplansettings);
                                                        var pageToConvertAsImage = 1;
                                                        storeAsImage(pageToConvertAsImage).then(function (resolve) {
                                                            console.log("Mensaplan converted");
                                                            channel_1.send({
                                                                content: "<@&" + general_settings_json_1.default.roles.mealplannotify + ">",
                                                                files: [
                                                                    resolve.path
                                                                ]
                                                            });
                                                            //channel.send(`<@&${settings.roles.mealplannotify}>`, { files: [resolve.path] });
                                                            channel_1.send("En Guada");
                                                            return resolve;
                                                        });
                                                    });
                                                }
                                            }
                                            else {
                                                //console.log("Mensaplan wurde heute schon pfostiert!");
                                            }
                                        }).catch(console.error);
                                    }
                                }
                                return [2 /*return*/];
                            });
                        });
                    }, meal_check_interval);
                }
                return [2 /*return*/];
            });
        });
    }
};
