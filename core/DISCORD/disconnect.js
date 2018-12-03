module.exports = async ( event ) => {
    event = event || {}
    Report.error(`BOT: ! Client disconnected : [${event.code}] : ${event.reason || event.message}`)
    
    //Either attempt to login again, or kill app
    if( event.code !== 4004 ) {
		Bot.discord.client.login( Bot.config.discord.token )
	} else {        
	    process.emit('SIGINT')
	}
}
