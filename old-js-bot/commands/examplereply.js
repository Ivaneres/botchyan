const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        message.channel.send(`Example response!`);
    });
}
