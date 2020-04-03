const log = require("../logging.js");
const settings = require("../settings.json");
const Discord = require("discord.js");
const fs = require("fs");

exports.run = (client, message, args, config) => {
    return new Promise(async (resolve, reject) => {
        switch(args[0]){
            case "!Yuni":
                message.channel.send("Yuni nanodesu!");
                break;
            case "!ICAS":
                message.channel.send("Imperial cares deeply about our staff and students");
                break;
            case "!KCL":
                message.channel.send("[insert placeholder]");
                break;
        }
    });
}
