import { Message, MessageEmbed } from "discord.js";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('xp.sqlite');
import Keyv from "keyv";
import { toLevel } from "../functions/extensions"


module.exports = {
  name: "leaderboard",
  admin: false,
  description: "Shows the top 10 players",
  args: false,
  guildOnly: true,
  aliases: ["scoreboard", "scores"],
  async execute(message: Message, args: string[]) {
    //db1
    // Key: iD, Value: XP
   // const dbxp = new Keyv("sqlite://xp.sqlite");
   // dbxp.on("error", (err: any) => console.error("Keyv connection error:", err));
   interface User {
    id: any,
    xp: any
    levels: any
   }
   let users: User[] = new Array();

   db.serialize(function() {

    db.run("SELECT * FROM keyv ORDER BY value DESC LIMIT 10");
  
    var stmt = db.prepare("SELECT * FROM keyv ORDER BY value DESC LIMIT 10");
    stmt.all(function(err, rows: Array<any>) {
        
        if (err) {
            throw err;
        }
        rows.forEach(function (row) {
            //console.log(row.key + ": " + row.value);
            //let [ userid, levelfloat ] = /keyv:(?<userid>\d+):\s{"value":(?<levelfloat>\d.?\d+),"expires":null}/gmi.exec(row)!;

            // parse row as json

            let userid = row.key.replace("keyv:", "");
            let xp = row.value.replace("{\"value\":", "").replace(",\"expires\":null}", "");
            let level = toLevel(xp);
            
            users.push({
                id: userid,
                xp: xp,
                levels: level
            });

        });
    });
    stmt.finalize();
    
    });
  
    db.close();

    // if users is empty, wait for the db operation to finish
    while (users.length == 0) {
        console.log("waiting for db");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    

    message.reply({
        embeds: [
            new MessageEmbed()
            .setTitle("Top 10 by Level")
            .setColor("#0099ff")
            .setDescription(users.map(user => `<@${user.id}> is level ${user.levels} with ${user.xp} XP`).join("\n"))
        ]
    })
  

  },
};
