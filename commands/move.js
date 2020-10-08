const discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    if (!message.member.roles.cache.has(bot.config.roles.staffrole)) return message.reply(`:x: You do not have permission to execute this command.`)

    let questions = ["To which category do you want to move this ticket? *choose between: technical, general, management*"];
        let answers = [];

        for(let i = 0; i < questions.length; i++) {
            let question = questions[i];
             message.channel.messages.fetch()
            message.channel.send(question);
            await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
            .then(msg => {
                msg = msg.first();
                answers.push(msg.content);
            })
            .catch(err => message.reply("You responded to late, try again"));
        }

        if (answers[0] === `technical`) {
            message.channel.updateOverwrite('752941835944722574', { VIEW_CHANNEL: true });
            message.channel.updateOverwrite(bot.config.roles.staffrole, {VIEW_CHANNEL: false});
            message.channel.updateOverwrite('752942139477852251', {VIEW_CHANNEL: true})

            let embed = new discord.MessageEmbed()
            .setTitle(`Successfully changed category.`)
            .setColor(bot.config.color)
            .setFooter(bot.config.footer)
            message.channel.send(embed)
        }

        if (answers[0] === `general`) {
            message.channel.updateOverwrite('752941835944722574', { VIEW_CHANNEL: true });
            message.channel.updateOverwrite(bot.config.roles.staffrole, {VIEW_CHANNEL: true});
            message.channel.updateOverwrite('752942139477852251', {VIEW_CHANNEL: true})

            let embed = new discord.MessageEmbed()
            .setTitle(`Successfully changed category.`)
            .setColor(bot.config.color)
            .setFooter(bot.config.footer)
            message.channel.send(embed)
        }

        if (answers[0] === `management`) {
            message.channel.updateOverwrite('752941835944722574', { VIEW_CHANNEL: false });
            message.channel.updateOverwrite(bot.config.roles.staffrole, {VIEW_CHANNEL: false});
            message.channel.updateOverwrite('752942139477852251', {VIEW_CHANNEL: true})

            let embed = new discord.MessageEmbed()
            .setTitle(`Successfully changed category.`)
            .setColor(bot.config.color)
            .setFooter(bot.config.footer)
            message.channel.send(embed)
        }
    
}

module.exports.help = {
    name: "move",
    description: "Sluit een ticket.",
}