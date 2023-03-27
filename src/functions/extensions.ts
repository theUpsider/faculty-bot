//const settings = require("../general-settings.json");
import settings from "../../general-settings.json";
import fs from "fs";
//const fs = require('fs');
import http from "http";
//const http = require('http');
import https from "https";
import { Client, GuildChannel, Message, TextChannel, EmbedBuilder, Embed } from "discord.js";
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

export const RSS = (client: Client) => {
  //Makin the Code more Readable
  let rssChannels = settings.RSSsettings.rssChannels;
  let RSSURLs = settings.RSSsettings.RSSURLs;


  if(rssChannels.length == RSSURLs.length) {
    if(new Date().getHours() >= settings.RSSsettings.RSSCheckAfterTimeHours) {
      
      for (let i = 0; i < rssChannels.length; i++) {
        let channel = client.channels.cache.get(rssChannels[i]) as TextChannel;
        if(channel) {
          channel.messages.fetch({ limit: 1 }).then(messages => {
              if (channel != undefined) {
                // get rss feed
                if(channel.lastMessage?.embeds[0] && channel.lastMessage.embeds[0].title) {
                  PrepareMessageAndSend(channel, channel.lastMessage.embeds[0], RSSURLs[i]);
                } else {
                  PrepareMessageAndSend(channel, new EmbedBuilder().setTitle("Hatsune Miku").setFooter({text: "UwU"}),  RSSURLs[i]);
                }
              } 
          }).catch(console.error);
        }
      }
    }
  }
}



async function PrepareMessageAndSend(channel: TextChannel, lastmsg: EmbedBuilder | Embed, specificURL: string) {
  const parser = new Parser();
  const feed = await parser.parseURL(specificURL);
  const latestPost = feed.items?.[0];
  var sameTitle = false;
  var samePubDate = false;

  if (latestPost) {
    const embed = new EmbedBuilder()
    // hehe
    .setColor(0xb00b69);

    if (latestPost.title) {
      embed.setTitle(latestPost.title);
      if ((lastmsg as Embed).title == latestPost.title) {
        //console.log("Post titles Match!");
        sameTitle = true;
      }
    }

    if(latestPost.pubDate) {
      // Removes unnecessary chars from timestamp
      var mystring: string = latestPost.pubDate.replace(/\+[0-9]*$/, '');
      if((lastmsg as Embed).footer) {
        // strings won't match, when no regex removal is done
        if((lastmsg as Embed).footer?.text.toLowerCase().replace(/(\n*)( *)/g, '') == mystring.toLowerCase().replace(/(\n*)( *)/g, '')) {
          samePubDate = true;
        }
      }
      // embed.setTimestamp won't take pubDate and isoDate isn't gonna cut it
      embed.setFooter({text: mystring});
    }

    if (latestPost.link) {
      embed.setURL(latestPost.link);
    }

    if (latestPost.content) {
      // Removes unneccessary text from feed (HSKE specific)
      embed.setDescription(latestPost.content.replace(/\nall$/, ''));
      //console.log("\nEmbed desc: \n" + embed.description);
    }

    if (channel && !sameTitle) {
      channel.send({
        content: "Neue Nachricht im Planungsportal:",
        embeds: [embed]
      });
    } else if(channel && sameTitle && !samePubDate) {
      channel.send({
        content: "Der letzte Post im Planungsportal wurde aktualisiert",
        embeds: [embed]
      });
    } else {
      //console.log("Keine neuen Pfosten im Planungsportal");
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