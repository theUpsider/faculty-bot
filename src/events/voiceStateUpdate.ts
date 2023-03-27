import { VoiceState, Permissions, VoiceChannel, PermissionOverwriteManager, Snowflake, PermissionOverwrites, PermissionFlagsBits, ChannelType } from "discord.js";
import Keyv from "keyv";
import { FacultyManager } from "../index";
import settings from '../../general-settings.json';

module.exports = {
    event: "voiceStateUpdate",
    async execute (client: FacultyManager, [oldState, newState] : [VoiceState, VoiceState], { dbvoicechannels } : {dbvoicechannels: Keyv}) {
        try {
            let newUserChannelName;
            if (newState.channel !== null) {
              newUserChannelName = newState.channel.name;
            }
            let oldUserChannelName;
            if (oldState.channel !== null) {
              oldUserChannelName = oldState.channel.name;
            }
            if (oldUserChannelName === newUserChannelName) return;
        
            // When a create Channel has been clicked
            if (newUserChannelName === settings.channels.createChannel) {
              
              // `🔊 ${newState.member?.user.username}`,
                let newVC = newState.guild.channels.create(
                    {
                      name: `🔊 ${newState.member?.user.username}`,
                      type: ChannelType.GuildVoice,
                      permissionOverwrites: [
                        {
                            id: newState.member?.user.id! as Snowflake,
                            allow: [PermissionFlagsBits.ManageChannels],
                        }
                    ]
                    }
                ).then(function (result: VoiceChannel) {
                    // Move creator in his new channel
                    newState.member?.voice.setChannel(result);
                    // Store newly created channel id for deletion
                    dbvoicechannels.set(result.id, result.id);
                  });;
            }
         
            // Check if old channel was a temporary voice channel
            if (oldState.channel !== null) {
              let oldChannelId = oldState.channel.id;
              let trackedVoiceChannelId = dbvoicechannels.get(oldChannelId);
              trackedVoiceChannelId.then(function(channelId)
              {
                // If channel is tracked as temporary voice channel
                if (channelId != undefined) {
                  // If user was the last one in temporary channel, delete it
                  if(oldState.channel?.members.size == 0) {
                    // delete channel
                    oldState.channel?.delete();
                    // remove entry in tracker db
                    dbvoicechannels.delete(oldChannelId);
                  }
                }
              });
            }
            
          } catch (error) {
            console.error(error);
          }
    }
}

