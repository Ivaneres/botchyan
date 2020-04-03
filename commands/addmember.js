const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        let hasAccess = false;
        for (const role of settings.accessRoles) {
            hasAccess |= message.member.roles.cache.get(role);
        }
        
        if (!hasAccess) {
            return message.channel.send(`This command is only available for admins/committee.`);
        }

        if (args.length < 2) {
            return message.channel.send(`Not enough arguments provided.`);
        }

        const whois = JSON.parse(fs.readFileSync("./whois.json"));
        let username = args[0];
        const name = args.slice(1).join(" ");

        let user = undefined;
        const onlyNumbers = /^[0-9]*$/;
        
        if (!onlyNumbers.test(username)) {
            username = username.replace(/_/g, " ");
            const members = await message.guild.members.fetch();
            user = members.find(m => m.user.username === username);
        }
        else {
            user = await message.guild.members.fetch(username);
            if (user == null) {
                const members = await message.guild.members.fetch();
                user = members.find(m => m.user.username === username);
            }
        }

        if (user == null) {
            return message.channel.send(`The user was not found.`);
        }

        const uniRoles = {};

        for (const roleName in settings.roles) {
            if (settings.unis.includes(roleName.toLowerCase())) {
                uniRoles[roleName] = settings.roles[roleName];
            }
        }

        if (whois[user.id] == null) {
            whois[user.id] = {};
        }

        for (const uni in uniRoles) {
            if (message.member.roles.cache.has(uniRoles[uni])) {
                whois[user.id].university = uni;
            }
        }

        if (message.member.roles.cache.has(settings.roles.senpai)) {
            whois[user.id].senpai = true;
        }
        else {
            whois[user.id].senpai = false;
        }

        whois[user.id].verified = true;
        whois[user.id].name = name.capitaliseSpaces();

        message.channel.send(`Entry for ${user.user.username} updated successfully!`);
        if (message.author.id === user.id) {
            message.channel.send(`*You can also use !addself to update your own name*`);
        }
        fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
    });
}
