const log = require("./logging.js");
const key = require("./key.json");
const settings = require("./settings.json");
const fs = require("fs");
const utils = require("./util/roles.js");
const mascotBot = require("./mascotbot/initBot.js");

String.prototype.capitaliseFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Capitalises the first characters of strings with spaces 
 * i.e test example -> Test Example
 */
String.prototype.capitaliseSpaces = function() {
    let result = "";
    let split = this.split(" ");
    for (let i = 0; i < split.length; i++) {
        split[i] = split[i].capitaliseFirst();
    }
    return split.join(" ");
}

// require the discord.js module
const Discord = require('discord.js');

// create a new Discord client
const client = new Discord.Client();

// A map of users currently being checked to their current stage
const stages = {};

/**
 * Checks if a message is valid in regard to a certain stage
 * Stages count the progress through the verification process
 * @param message the Discord message object
 * @param {number} stage the stage number
 * @returns {object} isValid: boolean, error - the error message to display if not valid
 */
function checkMessageValidity(message, stage) {
	switch (stage) {
		case 0:
			return {
				"isValid": Object.keys(settings.uniColours).indexOf(message.content.toLowerCase()) !== -1,
				"error": "Invalid university name. "
			}
		case 2:
			return {
				"isValid": message.attachments.size > 0,
				"error": "Please attach an image of your ID!"
			}
		default:
			return {
				"isValid": message.content != "",
				"error": "Invalid message! Please try again."
			}
	}
}

/**
 * Stores relevant data according to the current stage
 * @param message Discord message object - the reply to the question
 * @param {number} stage related stage
 * @param {obect} whoisDB the object to update with the new data 
 */
function storeWhoisData(message, stage, whoisDB) {
	const stageMap = {
		0: "university",
		1: "name",
		2: "photo",
		3: "number",
		4: "senpai" // <-- not handled in here
	}

	if (stage === 2) {
		whoisDB[message.author.id].photo = message.attachments.first().url;
	}
	else {
		whoisDB[message.author.id][stageMap[stage]] = message.content.toUpperCase();
	}
}

/**
 * Converts a discord mention of the form <@id> to just the id
 * @param {string} mention
 * @returns {string} id
 */
function getID(mention) {
	return mention.replace(/<|>|@|!/g, "");
}

/**
 * Generates a Discord embed containing server stats
 * @returns {Discord.MessageEmbed}
 */
async function generateStatsEmbed() {
	const roleStats = await utils.getRoleStats(client);
	
	let embed = new Discord.MessageEmbed()
	.setTitle(settings.statsTitle)
	.setColor(settings.uniColours.other);
	let description = "";
	for (const uni in roleStats) {
		if (uni.length === 3) {
			description += `**${uni.toUpperCase()}**: ${roleStats[uni]}\n`;
		}
		else {
			description += `**${uni.capitaliseFirst()}**: ${roleStats[uni]}\n`;
		}
	}
	embed.setDescription(description);
	return embed;
}

let statsMessages = JSON.parse(fs.readFileSync("./stats_messages.json"));

/**
 * Updates the server role stats in the stats channel
 */
async function updateStats() {
	const guild = client.guilds.resolve(settings.guild);
	for (const channel of settings.statsChannels) {
		const statsChannel = guild.channels.resolve(channel);
		if (statsChannel == null) {
			return log.log("Stats channel not found. Pls fix!");
		}

		const statsEmbed = await generateStatsEmbed();

		if (statsMessages[statsChannel.id] == null) {
			const id = await statsChannel.send(statsEmbed);
			statsMessages[statsChannel.id] = id;
			fs.writeFileSync("./stats_messages.json", JSON.stringify(statsMessages));
			return log.log(`No stats message found for channel ${statsChannel.name}. Generating new one, id: ${id}`);
		}
	
		const message = await statsChannel.messages.fetch(statsMessages[statsChannel.id]);
	
		if (message == null) {
			const id = await statsChannel.send(statsEmbed);
			statsMessages[statsChannel.id] = id;
			fs.writeFileSync("./stats_messages.json", JSON.stringify(statsMessages));
			log.log(`Stats message for channel ${statsChannel.name} was not found. Generated new one, id: ${id}`);
		}
		else {
			message.edit(statsEmbed);
		}
	}
}

log.insertBreak();

client.on('ready', async () => {
	log.log("Loaded!");
	const verifChannel = await client.channels.fetch(settings.verifChannel);
	verifChannel.messages.fetch();
	updateStats();

	client.user.setActivity(`${settings.cmdkey}help`);
	// Apparently the bot will lose its presence after a long perioud of time, so just set it once per hour
	setInterval(() => {
		client.user.setActivity(`${settings.cmdkey}help`).catch(err => log.log(err.name)).catch(err => log.log(`setActivity error: ${err.message}`));
	}, 1000 * 60 * 60);

	setInterval(() => {
		updateStats().catch(err => log.log(`updateStats error: ${err.message}`));
	}, 10000);
});

client.on("shardDisconnect", () => log.log("Shard disconnected :("));
client.on("shardError", (e) => log.log(`Shard error: ${e.message}`));
client.on("shardReconnecting", () => log.log(`Shard reconnecting...`));
client.on("shardReady", () => log.log(`Shard ready`));
client.on("error", (e) => log.log(`Error: ${e.message}`));

client.on("message", async (message) => {
	if (message.author.bot) return;

	if (message.channel.type === "dm" 
		&& (whois = JSON.parse(fs.readFileSync("./whois.json")))[message.author.id] != null
		&& !whois[message.author.id].verified
	) {
		if (whois[message.author.id].rejected) return;
		
		const stage = stages[message.author.id];

		if (stage == null && !whois[message.author.id].verified) {
			stages[message.author.id] = 0;
			message.channel.send(`I'm really sorry, I encountered an error. Please enter your information again:`)
			return message.channel.send(settings.helloMessages[0].replace(/<user>/g, message.author.username));
		}

		if (stage === 4) {
			return message.channel.send("Please click the tick or the cross!");
		}

		if (stage > 4) {
			return message.channel.send(`We are currently reviewing your profile!`);
		}

		// Checking data validity
		const checkMessage = checkMessageValidity(message, stage);
		if (!checkMessage.isValid) {
			return message.channel.send(checkMessage.error);
		}

		storeWhoisData(message, stage, whois);

		const nextStage = ++stages[message.author.id];

		const msgContents = settings.helloMessages[nextStage].replace(/<user>/g, message.author.username);
		let sentMessage = await message.channel.send(msgContents);

		if (nextStage === 4) {
			await sentMessage.react("✅");
			await sentMessage.react("❌");
			const filter = (reaction, user) => !user.bot && ["❌", "✅"].indexOf(reaction.emoji.name) !== -1;
			const reacts = sentMessage.createReactionCollector(filter);
			reacts.on("end", () => console.log("ended for some reason"));
			reacts.on("collect", async r => {
				message.channel.send(settings.helloMessages.slice(-1)[0]);
				if (r.emoji.name === "❌") {
					whois[message.author.id].senpai = false;
				}
				else {
					whois[message.author.id].senpai = true;
				}
				// VERIFICATION QUESTIONS TERMINATE HERE

				log.log(`User university: ${whois[message.author.id].university}`);

				// Send new user data to verification channel
				const embed = new Discord.MessageEmbed()
					.setTitle(whois[message.author.id].name)
					.addField("User", message.author)
					.addField("University", whois[message.author.id].university)
					.addField("ID Number", whois[message.author.id].number)
					.addField("Senpai", whois[message.author.id].senpai ? "Yes" : "No")
					.setImage(whois[message.author.id].photo)
					.setColor(settings.uniColours[whois[message.author.id].university.toLowerCase()]);

				const guild = client.guilds.resolve(settings.guild);
				const channel = guild.channels.resolve(settings.verifChannel);
				let verifMsg = await channel.send(embed);
				await verifMsg.react("✅");
				await verifMsg.react("❌");

				stages[message.author.id]++;
				
				fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
			});
		}
		fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
		return;
	}

    if (!message.content.startsWith(settings.cmdkey)) return;

    const args = message.content.slice(settings.cmdkey.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        let commandFile = require(`./commands/${command}.js`);
        if (!commandFile) return;
        commandFile.run(client, message, args, settings).then((success) => {
            log.log(`${command}: ` + success);
        }, (err) => {
            log.log(`${command}: ` + err);
        });
    } 
    catch (e) {
		if (e.message.includes("Cannot find module './commands/")) return;
        log.log(e);
    }
});

client.on("messageReactionAdd", async (r, user) => {
	if (user.bot) return;
	if (r.message.channel.id !== settings.verifChannel) return;
	if (["❌", "✅"].indexOf(r.emoji.name) === -1) return;
	if (r.message.embeds.length !== 1) return;

	const whois = JSON.parse(fs.readFileSync("./whois.json"));

	const userID = getID(r.message.embeds[0].fields[0].value);
	const member = await r.message.guild.members.fetch(userID);

	if (member == null) return;
	if (whois[member.id].rejected) return;
	// if (whois[member.id].verified) return;

	if (whois[member.id] == null) {
		r.message.channel.send(`It seems this member has left the server.`);
		return r.message.delete();
	}

	// if (whois[member.id].verified) {
	//  	  message.channel.send(`This member is already verified.`);
	//	  return r.message.delete();
	// };

	let confirm = null;

	if (r.emoji.name === "❌") {
		member.send(`You have been rejected.`);
		confirm = await r.message.channel.send(`User ${member} rejected by ${user.username}. This message will be deleted shortly.`);
		log.log(`User ${member.user.username} rejected by ${user.username}`);
		whois[member.id].rejected = true;
	}
	else {
		const roleID = settings.roles[whois[member.id].university.toLowerCase()];
		const role = await r.message.guild.roles.fetch(roleID);

		log.log(`${member.user.username} has uni ${whois[member.id].university} stored in DB. Adding role ${role.name}`);

		if (role == null) {
			r.message.channel.send(`Role for ${whois[member.id].university} is not set correctly.`);
			return log.log(`Role for ${whois[member.id].university} does not exit. FIX NOW!`);
		}

		member.roles.add(role);
		if (whois[member.id].senpai) {
			const senpaiRole = await r.message.guild.roles.fetch(settings.roles.senpai);
			if (senpaiRole == null) {
				r.message.channel.send(`Senpai role is not set correctly.`);
				return log.log("Senpai role does not exist. FIX NOW!");
			}
			member.roles.add(senpaiRole);
		}
		whois[member.id].verified = true;
		delete whois[member.id].photo;
		delete whois[member.id].number;
		confirm = await r.message.channel.send(`User ${member} verified by ${user.username}! This message will be deleted shortly.`);
		log.log(`User ${member.user.username} verified by ${user.username}`);
		member.send(`You have been verified! You now have access to the server. Please use the <#${settings.rolesChannel}> channel to give yourself access to any specific channels you want.`);
	}

	r.message.reactions.removeAll();

	setTimeout(() => {
		confirm.delete();
		r.message.delete();
	}, 10 * 60 * 1000);

	delete stages[member.id];
	fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
});

client.on("guildMemberAdd", async (member) => {
	log.log(`New user ${member.user.username} joining`);
	let dm = await member.createDM().catch(err => log.log(err));
	dm.send(settings.helloMessages[0].replace(/<user>/g, member.user.username));
	const whois = JSON.parse(fs.readFileSync("./whois.json"));
	stages[member.id] = 0;
	whois[member.id] = {
		"verified": false
	}
	fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
});

client.on("guildMemberRemove", member => {
	log.log(`User ${member.user.username} left`);
	const whois = JSON.parse(fs.readFileSync("./whois.json"));
	if (whois[member.id] == null) return;
	delete whois[member.id];
	delete stages[member.id];
	fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
});

// Logs in all of the sub-bots using the initlialisation function in mascotbot/initBot.js
if (key.mascotBots != null) {
	for (const token of key.mascotBots) {
		mascotBot.init(token);
	}
}

// login to Discord with your app's token
client.login(key.key).catch(err => log.log(`Login error: ${err.message}`));
