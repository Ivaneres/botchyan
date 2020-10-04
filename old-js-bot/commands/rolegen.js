const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");
const utils = require("../util/roles.js");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        let hasAccess = false;
        
        if (message.channel.type === `dm`) {
            hasAccess = true;
        }
        else {
            for (const role of settings.accessRoles) {
                hasAccess |= message.member.roles.cache.get(role);
            }
        }

        if (!hasAccess) {
            return message.channel.send(`This command is only available for admins/committee.`);
        }

        if (args.length < 5) {
            return message.channel.send("Not enough arguments provided.");
        }

        if (args.length % 2 !== 1) {
            return message.channel.send(`Arguments are invalid.`);
        }

        const title = args[0].replace(/_/g, " ");
        const description = args[1].replace(/_/g, " ");
        const colour = args[2];

        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor(colour);

        for (let i = 3; i < args.length - 1; i += 2) {
            embed.addField(args[i], args[i + 1] + "⠀⠀⠀⠀⠀⠀⠀⠀", true);
        }

        if ((((args.length - 3) / 2) - 2) % 3 === 0) {
            embed.addField("⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀", true);
        }

        message.delete();
        message.channel.send(embed);
    });
}
