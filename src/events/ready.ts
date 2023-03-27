import { Client, ClientEvents, Message, AttachmentBuilder, TextChannel, EmbedBuilder, ActivityType, REST, Routes } from "discord.js";
import settings from '../../general-settings.json';
import { download, RSS, add4WeeksToDate, adsdbloop } from '../functions/extensions';
import { fromPath } from "pdf2pic"; 
import Parser from "rss-parser";
import Keyv from "keyv";
import { FacultyManager } from "index";

module.exports = {
    event: "ready",
    async execute(client: FacultyManager) {

      const rest = new REST({ version: '10' }).setToken(client.token);
      for (const command of client.commands.values()) {
          if (!command.slashSetup) {
              continue;
          }
          try {
              console.log('Started refreshing application (/) commands.');
              await rest.put(
                  Routes.applicationCommands(client.user?.id),
                  { body: client.commands.map(command => command.slashSetup?.toJSON()) },
              );
  
          } catch (error) {
              console.error(error);
          }
  
      }
      console.log(`Successfully reloaded ${client.commands.size} commands.`);

  
        
        console.log(`${client.user?.tag } is ready!`);
        client.user?.setPresence({
            activities: [{
                name: `..help`,
                type: ActivityType.Listening
            }]
        });

        console.info(`Logged in as ${client.user?.tag}!`);
      
        // const options = {
        //   density: 400,
        //   quality: 100,
        //   saveFilename: "mensaplan",
        //   savePath: "./",
        //   format: "png",
        //   width: 768,
        //   height: 512
        // };
      
        // mealplan check
        const minutes = settings.settings.mealplancheck, meal_check_interval = minutes * 60 * 1000;
        // if feature is activated
        if (settings.settings.postMealplan) {
          console.log("Mensaplan activated")
          setInterval(async function () {
            let isWeekdayNow = new Date().getDay() == settings.settings.mealplandaycheck ? 1 : 0
            if (isWeekdayNow) {
              // if after x hours on the new day
              if (new Date().getHours() >= settings.settings.mealplanhourscheck) {
                let channel = client.channels.cache.get(settings.channels.mealPlan) as TextChannel;
                // check if already posted today
                // get last message from channel
                if(channel)
                  // if not been posted today
                  channel.messages.fetch({ limit: 1 }).then(messages => {
                    let lastMessage = channel.lastMessage?.createdTimestamp;
                    if (new Date(lastMessage!).getDate() != new Date().getDate()) {
                      if (channel != undefined) {
                        download(settings.settings.mealplan, settings.settings.mealplanpdfpath).then(download => {
        
                          console.log("Mensaplan downloaded");
                          // ConvertedFile
                          const storeAsImage = fromPath(settings.settings.mealplanpdfpath, settings.settings.mealplansettings);
                          const pageToConvertAsImage = 1;
        
                          storeAsImage(pageToConvertAsImage).then((resolve: any) => {
                            console.log("Mensaplan converted");
                            let roleId = channel.guild.roles.cache.find(
                              role => role.name === settings.roles.mealplannotify
                              );
                            channel.send({
                              content: roleId?.mentionable ? `<@&${settings.roles.mealplannotify}>` : "",
                              files: [
                                resolve.path
                              ]
                            }).then(message => {
                              message.crosspostable ? message.crosspost() : null; // broadcast message to all subbed servers
                            })
                            //channel.send(`<@&${settings.roles.mealplannotify}>`, { files: [resolve.path] });
                            channel.send("En Guada")
                            return resolve;
                          });
        
                        })
                      }
                    } else {
                      //console.log("Mensaplan wurde heute schon pfostiert!");
                      
                    }
                  }).catch(console.error);
              }
            }
          }, meal_check_interval);
        }

        // rss feed check
        // checks 1x every hour
        const rss_check_interval = settings.RSSsettings.RSSCheckIntervalHours * 60 * 1000 * 60;
        // if feature is activated
        if (settings.RSSsettings.postRSS){
          console.log("RSS activated")
          setInterval(async function () {
            RSS(client);
          }, rss_check_interval);
        }

        /* setInterval(() => {
          adsdbloop(client, new Keyv("sqlite://ads.sqlite"))
        }, 10000) */
      
        // after startup, check if any voice channel are left over in the db (after a crash for example)
        // TODO:
    }
};