const log = require("../logging.js");
const Discord = require("discord.js");
const settings = require("../settings.json");

exports.run = (client, message, args, config) => {
    return new Promise((resolve, reject) => {
        const formattedUnis = settings.unis.map(i => {
            if (i.length === 3) return i.toUpperCase();
            return i;
        });
        const embed = new Discord.MessageEmbed()
        .setTitle("Help")
        .setColor(settings.uniColours.other)
        .setDescription(`**${config.cmdkey}whois** *username* - look up a user's real name
**${config.cmdkey}addself** *full-name* - adds your name to the whois database
**${config.cmdkey}deletself** - removes your name from the whois database
**${config.cmdkey}stats** - server stats
**${config.cmdkey}rolegen** *title description hex-colour emoji1 name1 emoji2 name2 ...* - generates an embed with role and captions. Titles and descriptions must use \\_ instead of spaces
**${config.cmdkey}editrolegen** *messageID title description hex-colour emoji1 name1 emoji2 name2 ...* - edits an embed with role and captions
**${config.cmdkey}addmember** *username/user-id* *full-name* - adds your account to the whois database. Usernames that have spaces must use \\_ instead`);
        message.channel.send({embed});
    });    
}
