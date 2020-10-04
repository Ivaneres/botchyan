const Discord = require("discord.js");

/**
 * A function which takes in a Discord bot token and initialises the client, specifying some behaviour
 */
exports.init = function(token) {
    const client = new Discord.Client();
    
    client.on("message", (message) => {
        // If the mentions (@pings) in the message contain this bot
        if (message.mentions.users.get(client.user.id) != null) {
            message.channel.send(`Hello World!`);
        }
    });

    client.login(token);
}