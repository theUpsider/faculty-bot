import { DMChannel, Guild, GuildChannel } from "discord.js";
import Keyv from "keyv";
import { FacultyManager } from "../index";

module.exports = {
    event: "channelUpdate",
    async execute (client: FacultyManager, [oldChannel, newChannel] : [GuildChannel, GuildChannel]) {
        if(newChannel == null)
        return;
      console.log("ChannelUpdate event fired");
      // Is a user created channel
      let isTracked = client.dbvoicechannels.get(newChannel.id);
      isTracked.then(function(channelId)
      {
        // If channel is tracked as temporary voice channel
        if (channelId != undefined) {
          if(!newChannel.name.startsWith("🔊")) {
            newChannel.setName("🔊 " + newChannel.name);
          }
        }
      });
    }

}