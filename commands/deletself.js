const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        if (args.length !== 0) {
            return message.channel.send(`This function does not take arguments.`);
        }

        const whois = JSON.parse(fs.readFileSync("./whois.json"));
        const name = args.join(" ");

        if (whois[message.author.id] != null && !whois[message.author.id].verified) {
            return message.channel.send(`You have not completed verification. Permission denied.`);
        }

        delete whois[message.author.id];

        message.channel.send("Entry removed.");
        fs.writeFileSync("./whois.json", JSON.stringify(whois, null, 4));
    });
}
