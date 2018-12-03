const util = require('util')
const STRING = OUTPUT["player-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.shipHelp.title,
        description : STRING.shipHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.shipHelp.example.name,
            value:util.format( 
                STRING.shipHelp.example.value,
                message.prefix+message.command,
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

        let shipName = message.parts.slice(2).filter(i => !Number(i) && !i.match(/\d{17,18}/) && i !== 'me')
        if( !shipName.length ) { 
            return message.reply(STRING.error.noShip)
        }
        
        //Parse allycodes
        let allycodes = await Bot.discord.util.allycodes( message )
        if( !allycodes.length ) {
            message.reply(STRING.error.noUser)
            return help( message )
        } 
        
        // We've got allycode - search it
        
        shipName = shipName.join(' ')

        const conversion = ( player ) => {
            return {
                name: player.name,
                allyCode: player.allyCode,
                ships: player.roster.filter(c => c.crew.length && c.nameKey.replace(/[-|']/g,"").toLowerCase().includes( shipName.replace(/[-|']/g,"").toLowerCase() )),
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

                if( player.ships.find(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === shipName.replace(/[-|']/g,"").toLowerCase()) ) {
                    player.ships = player.ships.filter(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === shipName.replace(/[-|']/g,"").toLowerCase())
                }

	            const embed = {
                    title : util.format(STRING.command.shipTitle, player.name, player.allyCode),
                    description : util.format(STRING.command.found, player.ships.length),
                    color: 0x8B3CB7,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(player.updated),
                    fields:[]
                }
                
                player.ships.forEach(async c => {

                    embed.description += c.nameKey.toLowerCase().replace(shipName, "**"+shipName+"**")+'\n',

                    Report.dev("BOT: Reporting ship:", c.nameKey)

                    let field = {
                        name:c.nameKey,
                        value:"",
                        inline:true
                    }
                    field.value += "★".repeat(c.rarity)+"☆".repeat(7 - c.rarity)
                    field.value += " **| L"+c.level+"**\n"
                    
                    field.value += "**"+STRING.command.fields.gp+"** : `"+c.gp.toLocaleString()+"`\n"

                    field.value += c.skills.reduce((str,s) => {
                        return str + "**"+s.tier+"** : *"+s.nameKey+"* "+(s.id.toLowerCase().includes('hardware') ? s.tier === 3 ? "✦" : "⟡" : "")+"\n"
                    },"")


                    field.value += '`--------------------------------`\n'

                    embed.fields.push( field )
                    
                })
                
                
                embed.description += '`--------------------------------`\n',

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
