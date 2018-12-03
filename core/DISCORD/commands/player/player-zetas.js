const util = require('util')
const STRING = OUTPUT["player-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.zetaHelp.title,
        description : STRING.zetaHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.zetaHelp.example.name,
            value:util.format( 
                STRING.zetaHelp.example.value,
                message.prefix+message.command,
                message.prefix+message.command
            )
        }]
    }
    message.channel.send({embed})
}


const command = async ( message ) => {
    
    let MESSAGE = null
    
    try {

        //Parse allycodes
        let allycodes = await Bot.discord.util.allycodes( message )
        if( !allycodes.length ) {
            message.reply(STRING.error.noUser)
            return help( message )
        } 
        
        const conversion = ( player ) => {
            return {
                name: player.name,
                allyCode: player.allyCode,
                characters: player.roster.filter(c => !c.crew.length),
                updated: (new Date(player.updated)).toLocaleString()
            }
        }
        
        //Query swapi for player profiles
        const { result, warning, error } = await Bot.swapi.players( allycodes, conversion )

        if( result.length ) { 

            //Echo each result
            result.forEach(async  player => {
            
                let zetas = player.characters.reduce((acc,a) => {
                    acc.push({name:a.nameKey,zetas:a.skills.filter(s => s.isZeta && s.tier === 8)})
                    return acc
                },[]).filter(z => z.zetas.length > 0)
                
                const total = zetas.reduce((sum,z) => { return sum + z.zetas.length },0)

	            const embed = {
                    title : util.format(STRING.command.zetaTitle, player.name, player.allyCode),
                    description : util.format(STRING.command.foundZetas, total, zetas.length),
                    color: 0x8B3CB7,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(player.updated),
                    fields:[]
                }
                
                embed.description += "`------------------------------`\n"

                zetas.sort((a,b) => b.zetas.length - a.zetas.length)
                embed.description += zetas.reduce((str,z) => {
                    return str + z.name + " " + "✦".repeat(z.zetas.length) +"\n"
                },"")                

                await Bot.discord.util.reply.swapi(message, embed, {warning:warning, error:error})

            })
            
        } else {
            await Bot.discord.util.reply.swapi(message, null, {warning:[], error:error})
        }
            
    } catch(error) {
        await Bot.discord.util.reply.error(message, error)
    }
    
}

module.exports = {
    help:help,
    command:command
}
