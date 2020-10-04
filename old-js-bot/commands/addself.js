const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        if (args.length < 1) {
            return message.channel.send(`You must provide a name.`);
        }
        const whois = JSON.parse(fs.readFileSync("./whois.json"));
        const name = args.join(" ");

        if (whois[message.author.id] != null && !whois[message.author.id].verified) {
            return message.channel.send(`You have not completed verification. Permission denied.`);
        }

        const uniRoles = {};
	const guild = client.guilds.resolve(settings.guild);
	const member = await guild.members.fetch(message.author.id);
	
	if (member == null) {
	    return message.channel.send("You are not a member.");
	}

        for (const roleName in settings.roles) {
            if (Object.keys(settings.uniColours).includes(roleName.toLowerCase())) {
                uniRoles[roleName] = settings.roles[roleName];
            }
        }

        if (whois[message.author.id] == null) {
            whois[message.author.id] = {};
        }

        for (const uni in uniRoles) {
            if (member.roles.cache.has(uniRoles[uni])) {
                whois[message.author.id].university = uni;
            }
        }

        if (member.roles.cache.has(settings.roles.senpai)) {
            whois[message.author.id].senpai = true;
        }
        else {
            whois[message.author.id].senpai = false;
        }

        whois[message.author.id].verified = true;
        whois[message.author.id].name = name.capitaliseSpaces();

        message.channel.send("Entry updated successfully!");
        fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
    });
}

// Hello world
