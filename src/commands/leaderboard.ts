import { Message, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import defineCommand from "../utils";

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('xp.sqlite');
import Keyv from "keyv";
import { toLevel } from "../functions/extensions"

export default defineCommand({
    slashSetup: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the top 10 players")
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
    run: async (client, ctx, args): Promise<void> => {
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
      
        const stmt = db.prepare("SELECT * FROM keyv ORDER BY value DESC LIMIT 10");
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
        
    
        ctx.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("Top 10 by Level")
                .setColor("#0099ff")
                .setDescription(users.map(user => `<@${user.id}> is level ${user.levels} with ${user.xp} XP`).join("\n"))
            ]
        })
    }
});
