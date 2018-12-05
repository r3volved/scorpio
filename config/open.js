module.exports = async ( commands ) => {

    //Init config data
    Report.dev('BOT: Loading config data')
    Bot.premium   = Bot.config.discord.premium.length   ? require(process.cwd()+Bot.config.discord.premium)   : []
    Bot.blacklist = Bot.config.discord.blacklist.length ? require(process.cwd()+Bot.config.discord.blacklist) : []

    //Init swapi connection
    Report.dev('BOT: Loading swapi')
    Bot.swapi = require(process.cwd()+'/core/SWAPI')
    
    Report.dev('BOT: Starting swapi process')
    await Bot.swapi.open();


    if( Bot.config.discord && Bot.config.discord.token.length ) {
        //Init discord connection
        Report.dev('BOT: Loading discord')
        Bot.discord = require(process.cwd()+'/core/DISCORD')
        
        Report.dev('BOT: Loading discord commands')
        Bot.discord.commands = require(process.cwd()+'/core/DISCORD/commands')
        
        Report.dev('BOT: Starting discord bot')
        await Bot.discord.open();
    }    

}
