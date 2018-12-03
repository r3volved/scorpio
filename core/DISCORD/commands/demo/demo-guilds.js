const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {
    
    let MESSAGE = null
    
    try {

        const allycodes = message.parts.slice(2).filter(i => Number(i)).map(i => Number(i))
            
        const response = await Bot.swapi.guilds( allycodes, ( guild ) => {
            return {
                name: guild.name,
                members: guild.members,
                guildGP: guild.gp.toLocaleString(),
                updated: (new Date(guild.updated)).toLocaleString()
            }
        })

        const embed = {
            title:'Demo guild',
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
