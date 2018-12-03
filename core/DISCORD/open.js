module.exports = ( config ) => {

    //Merge config with default
    Bot.config.discord = Object.assign( Bot.config.discord, config )
    
    //Create new discord client
    const Discord = require('discord.js')
    Bot.discord.client = new Discord.Client()
    
    //Attach discord event handlers
    Bot.discord.client.on('ready',        Bot.discord.ready);
    Bot.discord.client.on('warn',         Bot.discord.warn);
    Bot.discord.client.on('error',        Bot.discord.error);
    Bot.discord.client.on('disconnect',   Bot.discord.disconnect);
    Bot.discord.client.on('reconnecting', Bot.discord.reconnecting);
    Bot.discord.client.on('resumed',      Bot.discord.resumed);
    
    
    //Attach discord message monitor
    Bot.discord.client.on('message',      Bot.discord.message);
    Bot.discord.client.on('messageUpdate',Bot.discord.message);


    //Sign in to discord
    Bot.discord.client.login( Bot.config.discord.token );

}
