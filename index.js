require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const Keyv = require('keyv');
const sqlite3 = require('sqlite3').verbose();
var RiotRequest = require('riot-lol-api');
const { prefix, token, riotapikey } = require('./config.json');
const settings = require('./general-settings.json')
const fs = require('fs');

const globalPrefix = '..';
const bot = new Discord.Client();

//Riot API 
var riotRequest = new RiotRequest(riotapikey);

// cooldowns
const cooldowns = new Discord.Collection();
// commands
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // read file with commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command); // with the key as the command name and the value as the exported module
}

//db stuff
let db = new sqlite3.Database(':memory:', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the in-memory SQlite database.');
});
//db1
// Key: teamname, Value: Teamleader (Summonername)
const dbteams = new Keyv('sqlite://teams.sqlite'); // const keyv = new Keyv(); // for in-memory storage //
dbteams.on('error', err => console.error('Keyv connection error:', err));
//db2
// const dbjob = new Keyv('sqlite://job.sqlite');
// dbjob.on('error', err => console.error('Keyv connection error:', err));

bot.login(token);

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
	//setInterval(updateBadges, 2000);
});

bot.on('message', async message => {
	if (message.author.bot) return;

	if (!message.content.startsWith(prefix)) return;


	//filter args
	const args = message.content.slice(prefix.length).split(/ +/); //filter args
	const commandName = args.shift().toLowerCase();

	//command checking aliases
	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	//error checking
	//guild check
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}
	// 18 check
	// if (message.channel.type != "dm")
	// 	if (!message.channel.parent.name.includes('18+'))
	// 		return;

	//args check
	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	// cooldown
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1).toHHMMSS()} before reusing the \`${command.name}\` command.`);
		}
	} else {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------
	// Execute command
	// ----------------------------------------------------------------------------------------------------------------------------------------------
	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

// ----------------------------------------------------------------------------------------------------------------------------------------------
// User Join
// ----------------------------------------------------------------------------------------------------------------------------------------------
bot.on('guildMemberAdd', member => {
	const embeded = new Discord.MessageEmbed()
		.setColor(settings.colors.blue)
		.setTitle(`A new user has joined`)
		.setDescription(`Welcome **` + member.user.username + `** to the tournament server! Before doing anything else read <#${settings.channels.information}> and <#${settings.channels.rules}>. Any further questions should be directed towards our staff. Enjoy your stay!`)
		.setFooter(settings.footer);
	try {
		member.guild.channels.resolve(settings.channels.greetings).send(embeded);
	} catch (error) {
		console.log(error)
	}
});



// extended functionality
// ------------------------
String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10); // don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10) { hours = "0" + hours; }
	if (minutes < 10) { minutes = "0" + minutes; }
	if (seconds < 10) { seconds = "0" + seconds; }
	return hours + 'h ' + minutes + 'min ' + seconds + 'sec';
}

function attachIsImage(msgAttach) {
	var url = msgAttach.url;
	//True if this url is a png image.
	return url.indexOf("png", url.length - "png".length /*or 3*/)
		|| url.indexOf("jpg", url.length - "jpg".length /*or 3*/)
		|| url.indexOf("jpeg", url.length - "jpeg".length /*or 3*/) !== -1;
}

async function updateBadges() {
	const channel = bot.channels.find('name', 'badge')
	const { file } = await fetch("../exchange/users.json").then(response => response.json())
	channel.send(file)
}