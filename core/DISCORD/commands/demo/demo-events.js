const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {
    
    let MESSAGE = null
    
    try {

        const response = await Bot.swapi.events(event => {
            return {
                id: event.id,
                events: event.events.map(e => e.id),
                updated: (new Date(event.updated)).toLocaleString()
            }
        })

        const embed = {
            title:'Demo battles',
            description:JSON.stringify(response.result)
        }

        await Bot.discord.util.reply.swapi( message, embed, response, MESSAGE )
    
    } catch(error) {
        
        await Bot.discord.util.reply.error( message, error, MESSAGE )
    
    }
    
}

module.exports = {
    help:help,
    command:command
}
