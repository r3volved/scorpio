module.exports = async ( code ) => {

    Report.log( `BOT: Recieved kill code ${code}` )
    let errors = false;

    //Attempt discord termination    
    try { 
        await Bot.discord.close()
        Report.log( `BOT: Connection to discord has been terminated` )
    } catch(e) {
        Report.log( `BOT: Error disconnecting from discord` )
        Report.error( e )
    }

    //Attempt discord termination    
    try { 
        await Bot.swapi.close()
        Report.log( `BOT: Connection to swapi has been terminated` )
    } catch(e) {
        Report.log( `BOT: Error disconnecting from swapi` )
        Report.error( e )
    }

    //Attempt process termination
    if( errors ) {
        Report.log( `Bot has terminated with errors ...` )
        process.exit(1)
    } else {
        Report.log( `Bot has been terminated ... thanks for all the fish` )
        process.exit(0)
    }

}
