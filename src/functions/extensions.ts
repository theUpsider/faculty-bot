//const settings = require("../general-settings.json");
import settings from "../../general-settings.json";
import fs from "fs";
//const fs = require('fs');
import http from "http";
//const http = require('http');
import https from "https";
import { Client, GuildChannel, Message, TextChannel, MessageEmbed } from "discord.js";
import { Canvas } from "canvas";
import Keyv from "keyv";
import Parser from "rss-parser";
import request from "request";
//const https = require('https');


const mailVerification = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
const studentEmailVerification = new RegExp(/^[A-Za-z0-9._%+-]+@stud.hs-kempten.de$/gmi)

// xp calculation





export const toLevel = (number: number): number => {
  return (0.01 * number) ^ 0.8;
};

export const validateEmail = (email: string, message: Message): boolean => {
  if (studentEmailVerification.test(email)) {
    return true;
  } else {
    message.channel.send("Please enter a valid email address. \n try using the scheme: `..verify max.mustermann@stud.hs-kempten.de`");
    return false;
  }
}

export const logMessage = async (message: Message, msg: string): Promise<void> => {
  const logChannel = message?.guild?.channels.cache.find(
    channel => channel.name === settings.channels.logs
  ) as TextChannel;
  if (logChannel) {
    await logChannel.send(msg);
  }
}

export const rss = (client: Client) => {
  if(settings.RSSsettings.rssChannels.length == settings.RSSsettings.RSSURLs.length) {
    if(new Date().getHours() >= settings.RSSsettings.RSSCheckAfterTimeHours) {
      // FOREACH
      for (let i = 0; i < settings.RSSsettings.rssChannels.length; i++) {
        let channel = client.channels.cache.get(settings.RSSsettings.rssChannels[i]) as TextChannel;
        if(channel) {
          channel.messages.fetch({ limit: 1 }).then(messages => {
            let lastMessage = channel.lastMessage?.createdTimestamp;
            //if (new Date(lastMessage!).getDate() != new Date().getDate()) {
              if (channel != undefined) {
                // get rss feed
                if(channel.lastMessage?.embeds[0] && channel.lastMessage.embeds[0].title) {
                  rsshelper(channel, channel.lastMessage.embeds[0].title, settings.RSSsettings.RSSURLs[i]);
                } else {
                  rsshelper(channel, "Hatsune Miku",  settings.RSSsettings.RSSURLs[i]);
                }
              } else {
              //console.log("RSS Feed wurde heute schon pfostiert!");
            }
          //}
          }).catch(console.error);
        }
      }
    }
  }
}

export const rsshelper = async (client, lastmsg, specificURL) => {
  const parser = new Parser();
  const feed = await parser.parseURL(specificURL);
  const latestPost = feed.items?.[0];
  var samemsg = false;

  if (latestPost) {
    const test = new String(latestPost.title);
    const embed = new MessageEmbed();
    if (latestPost.title) {
      embed.setTitle(latestPost.title);
      if(lastmsg == latestPost.title) {
        //console.log("Post titles Match!");
        samemsg = true;
      }
    }

    if (latestPost.link) {
      embed.setURL(latestPost.link);
    }
    
    if (latestPost.content) {
      embed.setDescription(latestPost.content.replace(/\nall$/, ''));
      //console.log("\nEmbed desc: \n" + embed.description);
    }

    const channel = client;
    if (channel && !samemsg) {
      channel.send({
        content: "El Plan(ungsportal)",
        embeds: [embed]});
    }
  }
}


export const download = (url: string, filepath: string) => {
  const proto = !url.charAt(4).localeCompare('s') ? https : http;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    let fileInfo: any = null;

    const request = proto.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      fileInfo = {
        mime: response.headers['content-type'],
        size: parseInt(response.headers['content-length'] as string, 10)
      };

      response.pipe(file);
    });

    // The destination stream is ended by the time it's called
    file.on('finish', () => resolve(fileInfo));

    request.on('error', err => {
      fs.unlink(filepath, () => reject(err));
    });

    file.on('error', err => {
      fs.unlink(filepath, () => reject(err));
    });

    request.end();
  });
};


export const add4WeeksToDate = (date: Date): number => {
  const in4Wks = new Date()
  return in4Wks.setDate((date.getDate() as number) + 28);
}

export const adsdbloop = async (client: Client, adsdb: Keyv) => {
  console.log("scanning for old ads...");
  let adsChn = await client.channels.cache.get(settings.channels.ads)?.fetch() as TextChannel;
  let ads = await adsChn.messages.fetch();
  ads.forEach(async (msg) => {
    console.log(msg.id);
  })
  


}


// Pass the entire Canvas object because you'll need to access its width, as well its context
export const applyText = (canvas: Canvas, text: string): string => {
  const ctx = canvas.getContext("2d");

  // Declare a base size of the font
  let fontSize = 70;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${(fontSize -= 10)}px sans-serif`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (ctx.measureText(text).width > canvas.width - 300);

  // Return the result to use in the actual canvas
  return ctx.font;
};

export const toHHMMSS = (time: string): string => {
  var sec_num = parseInt(time, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600) as unknown as string;
  var minutes = Math.floor((sec_num - Number(hours) * 3600) / 60) as unknown as string;
  var seconds = (sec_num - Number(hours) * 3600 - Number(minutes) * 60) as unknown as string ;

  if (Number(hours) < 10) {
    hours = "0" + hours as string;
  }
  if (Number(minutes) < 10) {
    minutes = "0" + minutes;
  }
  if (Number(seconds) < 10) {
    seconds = "0" + seconds;
  }
  return hours + "h " + minutes + "min " + seconds + "sec";
};

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