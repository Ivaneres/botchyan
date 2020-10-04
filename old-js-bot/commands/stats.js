const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");
const utils = require("../util/roles.js");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
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
        message.channel.send(embed);
    });
}
