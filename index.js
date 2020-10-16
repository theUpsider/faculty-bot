require('dotenv').config();
const Discord = require('discord.js');
const Canvas = require('canvas');
const fetch = require('node-fetch');
const Keyv = require('keyv');
const sqlite3 = require('sqlite3').verbose();
var RiotRequest = require('riot-lol-api');
const { prefix, token, riotapikey, mailpw } = require('./config.json');
const MailPw = mailpw; // prevent on demand loading
const { toLevel } = require('./functions/extensions.js');
const settings = require('./general-settings.json')
const fs = require('fs');
var Imap = require('imap'),
	inspect = require('util').inspect;


const bot = new Discord.Client();

// Mail https://github.com/mscdex/node-imap
var imap = new Imap({
	user: 'info@akgaming.de',
	password: MailPw,
	host: 'imap.ionos.de',
	port: 993,
	tls: true
});

function openInbox(cb) {
	imap.openBox('INBOX', true, cb);
}

// imap.once('ready', function () {
// 	openInbox(function (err, box) {
// 		if (err) throw err;
// 		var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM SUBJECT)', 'TEXT'] });
// 		f.on('message', function (msg, seqno) {
// 			console.log('Message #%d', seqno);
// 			var prefix = '(#' + seqno + ') ';
// 			msg.on('body', function (stream, info) {
// 				if (info.which === 'TEXT')
// 					console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
// 				var buffer = '', count = 0;
// 				stream.on('data', function (chunk) {
// 					count += chunk.length;
// 					buffer += chunk.toString('utf8');
// 					if (info.which === 'TEXT')
// 						console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
// 				});

// 				stream.once('end', function () {
// 					if (info.which !== 'TEXT') {
// 						console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
// 						const subject = Imap.parseHeader(buffer).subject[0]

// 						console.log(subject)
// 					}
// 					else
// 						console.log(prefix + 'Body [%s] Finished', inspect(info.which));
// 				});
// 			});
// 			msg.once('attributes', function (attrs) {
// 				console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
// 			});
// 			msg.once('end', function () {
// 				console.log(prefix + 'Finished');
// 			});
// 		});
// 		f.once('error', function (err) {
// 			console.log('Fetch error: ' + err);
// 		});
// 		f.once('end', function () {
// 			console.log('Done fetching all messages!');
// 			imap.end();
// 		});
// 	});
// 	imap.closeBox(function (err) {
// 		console.log(err);
// 	})
// });

// imap.subscribeBox('INBOX', function (err) {
// 	console.log(err);
// })
// imap.once('mail', function (nummeSsages) {
// 	console.log('YAAY: ', nummeSsages)
// })

// imap.once('error', function (err) {
// 	console.log(err);
// });

// imap.once('end', function () {
// 	console.log('Connection ended');
// });

// imap.connect();

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
// Key: discord ID, Value: xp value
const dbxp = new Keyv('sqlite://xp.sqlite'); // const keyv = new Keyv(); // for in-memory storage //
dbxp.on('error', err => console.error('Keyv connection error:', err));
// Key: student-email, Value: verification date
const dbverify = new Keyv('sqlite://verify.sqlite');
dbverify.on('error', err => console.error('Keyv connection error:', err));
// Key: student-email, Value: discord-id
const map_emailToId = new Keyv('sqlite://map_emailToId.sqlite');
map_emailToId.on('error', err => console.error('Keyv connection error:', err));


bot.login(token);


setInterval(function () {
	imap.connect();

	imap.once('error', function (err) {
		console.log(err);
	});

	imap.once('end', function () {
		console.log('Connection ended');
	});
	imap.once('ready',async function () {
		openInbox(async function (err, box) {
			if (err) throw err;
			var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM SUBJECT)', 'TEXT'] });
			f.on('message', function (msg, seqno) {
				console.log('Message #%d', seqno);
				var prefix = '(#' + seqno + ') ';
				msg.on('body', function (stream, info) {
					if (info.which === 'TEXT')
						console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
					var buffer = '', count = 0;
					stream.on('data', function (chunk) {
						count += chunk.length;
						buffer += chunk.toString('utf8');
						if (info.which === 'TEXT')
							console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
					});

					stream.once('end',async function () {
						if (info.which !== 'TEXT'){
							console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
							const from = Imap.parseHeader(buffer).from[0]
							const endmail = from.split(`@`)[1].split(`>`)[0]
							if((endmail).toString().includes('stud.hs-kempten.de')){
								// is student
								// take subject to verify
								// TODO if something failed, answer mail whats wrong!
								console.log(endmail)
								const displayName = Imap.parseHeader(buffer).subject[0]	.split('#')[0]	
								const guild = bot.guilds.cache.find(id => id == settings.guildid);
								const memberToAdd = guild.members.cache.find(member => member.displayName == displayName);
            					memberToAdd.roles.add(settings.roles.verified);
						 }

						}
						else
							console.log(prefix + 'Body [%s] Finished', inspect(info.which));
					});
				});
				msg.once('attributes', function (attrs) {
					console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
				});
				msg.once('end', function () {
					console.log(prefix + 'Finished');
				});
			});
			f.once('error', function (err) {
				console.log('Fetch error: ' + err);
			});
			f.once('end', function () {
				console.log('Done fetching all messages!');
				imap.end();
			});
		});

	})

	// imap.closeBox(function (err) {
	// 	console.log(err);
	// });
}, 6000);


bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
	bot.user.setActivity('use ..help', { type: 'PLAYING' });
	//setInterval(updateBadges, 2000);
});

bot.on('message', async message => {
	if (message.author.bot) return;

	// no command! - simple message to track for XP
	if (!message.content.startsWith(prefix) && message.channel.type == 'text') {
		const userXP = await dbxp.get(message.author.id);

		// --------------------------------
		// const channel = message.guild.channels.cache.find(ch => ch.name === 'bot-commands');
		// if (!channel) return;
		console.log(inspect(message.author.username))

		//---------------------------------

		if (!userXP || userXP === undefined) {
			await dbxp.set(message.author.id, 1) // set to 1 for 1 XP
			return;
		} else {
			// if new level, post XP
			if (Math.trunc(toLevel(userXP + 1)) > Math.trunc(toLevel(userXP))) {
				// send level xp to xp channel
				const canvas = Canvas.createCanvas(700, 250);
				const ctx = canvas.getContext('2d');

				// Since the image takes time to load, you should await it
				const background = await Canvas.loadImage('./images/banner.png');
				// This uses the canvas dimensions to stretch the image onto the entire canvas
				ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
				// Select the color of the stroke
				ctx.strokeStyle = '#74037b';
				// Draw a rectangle with the dimensions of the entire canvas
				ctx.strokeRect(0, 0, canvas.width, canvas.height);

				// Select the font size and type from one of the natively available fonts
				ctx.font = '60px sans-serif';

				// Slightly smaller text placed above the member's display name
				ctx.font = applyText(canvas, `${message.author.username} has reached`);
				ctx.fillStyle = '#ffffff';
				ctx.fillText(`${message.author.username} has reached`, canvas.width / 2.4, canvas.height / 3.5);

				// Add an exclamation point here and below
				ctx.font = applyText(canvas, `LEVEL ${Math.trunc(toLevel(userXP + 1))}`);
				ctx.fillStyle = '#ffffff';
				ctx.fillText(`LEVEL ${Math.trunc(toLevel(userXP + 1))}`, canvas.width / 2.4, canvas.height / 1.5);

				// Use helpful Attachment class structure to process the file for you
				const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'level-up-image.png');


				message.channel.send(`Congrats, ${message.author}!`, attachment);
			}

			// New XP
			dbxp.set(message.author.id, userXP + 1);
		}

		return;
	}


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
	const cooldownAmount = (command.cooldown || 1) * 1000;
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
	// const embeded = new Discord.MessageEmbed()
	// 	.setColor(settings.colors.blue)
	// 	.setTitle(`A new user has joined`)
	// 	.setDescription(`Welcome **` + member.user.username + `** to the tournament server! Before doing anything else read <#${settings.channels.information}> and <#${settings.channels.rules}>. Any further questions should be directed towards our staff. Enjoy your stay!`)
	// 	.setFooter(settings.footer);
	// try {
	// 	member.guild.channels.resolve(settings.channels.greetings).send(embeded);
	// } catch (error) {
	// 	console.log(error)
	// }
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

// mail

// using the functions and variables already defined in the first example ...



// Pass the entire Canvas object because you'll need to access its width, as well its context
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};