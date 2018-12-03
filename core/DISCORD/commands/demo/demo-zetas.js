const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {
    
    let MESSAGE = null
    
    try {

        const response = await Bot.swapi.zetas(zeta => {
            return {
                zetas: Object.keys(zeta),
                updated: (new Date(zeta.updated)).toLocaleString()
            }
        })

        const embed = {
            title:'Demo zetas',
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
