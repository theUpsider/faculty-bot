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
exports.download = exports.logMessage = exports.validateEmail = exports.toLevel = exports.applyText = exports.toHHMMSS = void 0;
//const settings = require("../general-settings.json");
var general_settings_json_1 = __importDefault(require("../../general-settings.json"));
var fs_1 = __importDefault(require("fs"));
//const fs = require('fs');
var http_1 = __importDefault(require("http"));
//const http = require('http');
var https_1 = __importDefault(require("https"));
//const https = require('https');
var mailVerification = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
// xp calculation
var toHHMMSS = function (time) {
    var sec_num = parseInt(time, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - Number(hours) * 3600) / 60);
    var seconds = (sec_num - Number(hours) * 3600 - Number(minutes) * 60);
    if (Number(hours) < 10) {
        hours = "0" + hours;
    }
    if (Number(minutes) < 10) {
        minutes = "0" + minutes;
    }
    if (Number(seconds) < 10) {
        seconds = "0" + seconds;
    }
    return hours + "h " + minutes + "min " + seconds + "sec";
};
exports.toHHMMSS = toHHMMSS;
// Pass the entire Canvas object because you'll need to access its width, as well its context
var applyText = function (canvas, text) {
    var ctx = canvas.getContext("2d");
    // Declare a base size of the font
    var fontSize = 70;
    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = (fontSize -= 10) + "px sans-serif";
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);
    // Return the result to use in the actual canvas
    return ctx.font;
};
exports.applyText = applyText;
var toLevel = function (number) {
    return (0.01 * number) ^ 0.8;
};
exports.toLevel = toLevel;
var validateEmail = function (email, message) {
    if (mailVerification.test(email)) {
        return true;
    }
    else {
        message.channel.send("Please enter a valid email address. \n try using the scheme: `..verify max.mustermann@stud.hs-kempten.de`");
        return false;
    }
};
exports.validateEmail = validateEmail;
var logMessage = function (message, msg) { return __awaiter(void 0, void 0, void 0, function () {
    var logChannel;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                logChannel = (_a = message === null || message === void 0 ? void 0 : message.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.find(function (channel) { return channel.name === general_settings_json_1.default.channels.logs; });
                if (!logChannel) return [3 /*break*/, 2];
                return [4 /*yield*/, logChannel.send(msg)];
            case 1:
                _b.sent();
                _b.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.logMessage = logMessage;
var download = function (url, filepath) {
    var proto = !url.charAt(4).localeCompare('s') ? https_1.default : http_1.default;
    return new Promise(function (resolve, reject) {
        var file = fs_1.default.createWriteStream(filepath);
        var fileInfo = null;
        var request = proto.get(url, function (response) {
            if (response.statusCode !== 200) {
                reject(new Error("Failed to get '" + url + "' (" + response.statusCode + ")"));
                return;
            }
            fileInfo = {
                mime: response.headers['content-type'],
                size: parseInt(response.headers['content-length'], 10)
            };
            response.pipe(file);
        });
        // The destination stream is ended by the time it's called
        file.on('finish', function () { return resolve(fileInfo); });
        request.on('error', function (err) {
            fs_1.default.unlink(filepath, function () { return reject(err); });
        });
        file.on('error', function (err) {
            fs_1.default.unlink(filepath, function () { return reject(err); });
        });
        request.end();
    });
};
exports.download = download;
/* module.exports = {
  toLevel(number) {
    return (0.01 * number) ^ 0.8;
  },

  ValidateEmail(mail: any, message: any) {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        mail
      )
    ) {
      return true;
    }
    message.reply("You have entered an invalid email address! try using the scheme: ..verify max.mustermann@stud.hs-kempten.de");
    logMessage(message, `${message.author.username} entered a wrong email.`);
    return false;
  },
  // logs a message in the logs channel of the guild it was sent in
  async logMessage(message, msg) {
    (
      await message.guild.channels.cache
        .find((channel) => channel.name == settings.channels.logs)
        .fetch()
    ).send(msg);
    console.log(msg);
  },

  /**
   * Downloads file from remote HTTP[S] host and puts its contents to the
   * specified location.
   */
/*   async download(url, filePath) {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      let fileInfo = null;

      const request = proto.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }

        fileInfo = {
          mime: response.headers['content-type'],
          size: parseInt(response.headers['content-length'], 10),
        };

        response.pipe(file);
      });

      // The destination stream is ended by the time it's called
      file.on('finish', () => resolve(fileInfo));

      request.on('error', err => {
        fs.unlink(filePath, () => reject(err));
      });

      file.on('error', err => {
        fs.unlink(filePath, () => reject(err));
      });

      request.end();
    });
  }
};
 */ 
