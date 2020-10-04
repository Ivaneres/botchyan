const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        if (args.length === 0) {
            return message.channel.send(`Must provide a user.`);
        }
        const whois = JSON.parse(fs.readFileSync("./whois.json"));
        const username = args.join(" ").replace("\n", "");

        const guild = client.guilds.resolve(settings.guild);
        const fetched = await guild.members.fetch()

        member = fetched.find(m => m.user.username === username) || 
            fetched.find(m => m.nickname === username) ||
            fetched.find(m => m.id === username);

        if (member == null && message.mentions.members != null && message.mentions.members.array().length !== 0) {
            member = message.mentions.members.first();
        }

        if (member == null) {
            member = fetched.find(m => m.user.username.toLowerCase() === username) ||
                fetched.find(m => m.nickname != null && m.nickname.toLowerCase() === username);
        }

        if (member == null && username.indexOf("#") !== -1) {
            member = fetched.find(m => m.user.username === username.split("#")[0])
        }
        
        if (member == null) {
            const embed = new Discord.MessageEmbed().setTitle("User not found");
            return message.channel.send(embed);
        }

        if (member.id === client.user.id) {
            return message.channel.send("Das me!");
        }

        if (whois[member.id] == null) {
            const embed = new Discord.MessageEmbed().setTitle("User has not registered a name. Use the !addself command to register your name");
            return message.channel.send(embed);
        }

        const entry = whois[member.id];
        const formattedUni = entry.university.length === 3 ? 
            entry.university.toUpperCase() : 
            entry.university.capitaliseFirst();

        const embed = new Discord.MessageEmbed()
            .setTitle(entry.name.capitaliseSpaces())
            .addField("User", member.user)
            .addField("University", formattedUni)
            .addField("Senpai", entry.senpai ? "Yes" : "No")
            .setColor(settings.uniColours[entry.university.toLowerCase()]);
        const sent = await message.channel.send(embed);

        setTimeout(() => {
            sent.delete();
        }, 10 * 60 * 1000);
    });
}
