module.exports = async () => {    
	Report.log(`BOT: Discord connected successfully`);
	Bot.discord.client.user.setActivity( Bot.config.discord.prefix+'help', { type: 'LISTENING' } )
        .then( presence => {
            //CONSOLE START-UP REPORT 
            Report.log(`BOT: Discord activity set to ${presence.game ? presence.game.name : 'none'}`)
            Report.log(`BOT: Discord listening for ${Object.keys(Bot.discord.commands).length} commands`)
        
        }).catch( Report.error );
}
