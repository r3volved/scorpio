const util = require('util')
const STRING = OUTPUT["player-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.shipArenaHelp.title,
        description : STRING.shipArenaHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.shipArenaHelp.example.name,
            value:util.format( 
                STRING.shipArenaHelp.example.value,
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
            
        // We've got allycode - search it
        
        const conversion = ( player ) => {
            const arenaIds = player.arena.ship.squad.map(c => c.defId)
            return {
                name: player.name,
                allyCode: player.allyCode,
                ships: player.roster.filter(c => arenaIds.includes(c.defId)),
                arena: player.arena,
                updated: (new Date(player.updated)).toLocaleString()
            }
        }
        
        //Query swapi for player profiles
        const { result, warning, error } = await Bot.swapi.players( allycodes, conversion )

        if( result.length ) { 

            //Echo each result
            result.forEach(async player => {
            
                Report.dev("BOT: Reporting player:", player.name)

	            const embed = {
                    title : util.format( STRING.command.shipArenaTitle, player.name, player.allyCode),
                    description : '`--------------------------------`\n',
                    color: 0x8B3CB7,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(player.updated),
                    fields:[]
                }
                
                const types = STRING.command.arenaTypes
                let gp = 0;

                player.arena.ship.squad.forEach(async unit => {
                    let c = player.ships.find(r => r.defId === unit.defId)
                    let field = {
                        name:c.nameKey,
                        value:"",
                        inline:true                        
                    }
                    
                    field.value += "★".repeat(c.rarity)+"☆".repeat(7 - c.rarity)+" **| "
                    field.value += "L"+c.level+"**\n"
                
                    field.value += "**"+types[unit.squadUnitType]+"** | **GP**: `"+c.gp.toLocaleString()+"`\n"
                    gp += c.gp

                    field.value += c.skills.reduce((str,s) => {
                        return str + "**"+s.tier+"** : *"+s.nameKey+"* "+(s.id.toLowerCase().includes('hardware') ? s.tier === 3 ? "✦" : "⟡" : "")+"\n"
                    },"")

                    field.value += '`--------------------------------`\n'

                    embed.fields.push( field )

                })
                
                embed.description += "**"+STRING.command.fields.gp+"** : "+gp.toLocaleString()+"\n"
                embed.description += "**"+STRING.command.fields.arenaRank+"**: "+player.arena.ship.rank+"\n"
                embed.description += '`--------------------------------`\n'
                

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
