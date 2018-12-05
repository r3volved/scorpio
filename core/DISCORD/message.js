module.exports = async ( message ) => {

    if( Bot.blacklist.includes(message.author.id) ) {
        Report.log("Ungrateful bitch:", message.author.id, message.author.username)
        Report.log(message.content)
        
    }
    
	/** Ignore conditions **/
	if( message.author.bot ) { return }
	if( !message.content.startsWith( Bot.config.discord.prefix ) ) { return }

    Report.dev( "=".repeat(40) )
    Report.dev( "BOT: Message:", message.content )

    /** Parse message body **/
    const content = message.content.split("");
    message.parts = [];

    //Splice out prefix
    message.prefix = content.splice( 0, Bot.config.discord.prefix.length ).join()
    message.parts.push( message.prefix );

    //Concat split content
    message.parts = message.parts.concat( content.join("").split(/\s+/) )
    
    Report.dev( "BOT: Message parts:", message.parts )
    
    /** Handle command if exists **/
    message.command = message.parts[1]

    Report.dev( "BOT: Command handler:", message.command, !!Bot.discord.commands[message.command] )

    let help = message.parts.slice(2).includes('help')
    if( !!Bot.discord.commands[message.command] ) {
        Report.info("CMD: Routing to "+message.prefix+message.command)
        return help ? await Bot.discord.commands[message.command].help( message ) : await Bot.discord.commands[message.command].command( message )
    }
    
}
