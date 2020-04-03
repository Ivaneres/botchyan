const log = require("../logging.js");
const Discord = require("discord.js");
const settings = require("../settings.json");

exports.run = (client, message, args, config) => {
    return new Promise((resolve, reject) => {
        let channel = message.channel;
        channel.send("pong");
    });    
}
