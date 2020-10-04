const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");
const utils = require("../util/roles.js");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        if (message.channel.type === `dm`) {
            return message.channel.send(`You cannot do that here.`);
        }
        
        let hasAccess = false;
        for (const role of settings.accessRoles) {
            hasAccess |= message.member.roles.cache.get(role);
        }

        if (!hasAccess) {
            return message.channel.send(`This command is only available for admins/committee.`);
        }

        if (args.length < 6) {
            return message.channel.send("Not enough arguments.");
        }

        if (args.length % 2 !== 0) {
            return message.channel.send(`Arguments are invalid.`);
        }

        const messageID = args[0];
        const title = args[1].replace(/_/g, " ");
        const description = args[2].replace(/_/g, " ");
        const colour = args[3];

        const messageToEdit = await message.channel.messages.fetch(messageID);
        if (messageToEdit == null) {
            return message.channel.send(`Message with that ID not found.`);
        }

        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor(colour);

        for (let i = 4; i < args.length - 1; i += 2) {
            embed.addField(args[i], args[i + 1] + "⠀⠀⠀⠀⠀⠀⠀⠀", true);
        }

        if ((((args.length - 4) / 2) - 2) % 3 === 0) {
            embed.addField("⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀", true);
        }

        message.delete();
        messageToEdit.edit(embed);
    });
}
