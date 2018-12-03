const util = require('util')
const STRING = OUTPUT["guild-info"]

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

        let charName = message.parts.slice(2).filter(i => !Number(i) && !i.match(/\d{17,18}/) && i !== 'me')
        if( !charName.length ) { 
            return message.reply(STRING.error.noShip)
        }
        charName = charName.join(' ')
        
        //Parse allycodes
        let allycodes = await Bot.discord.util.allycodes( message )
        if( !allycodes.length ) {
            message.reply(STRING.error.noUser)
            return help( message )
        } 
        
        //Send loading message
        MESSAGE = await Bot.discord.util.loading(message, {
            title:allycodes.length > 1 
                ? util.format(STRING.command.loading.guilds, allycodes.join(", "))
                : util.format(STRING.command.loading.guild, allycodes[0])
        })

        //Query swapi for guild profiles
        const guilds = await Bot.swapi.guilds( allycodes, ( guild ) => {
            return {
                name:guild.name,
                members:guild.roster.map(m => m.allyCode),
                updated: guild.updated
            }
        })

        if( guilds.result.length ) { 

            guilds.result.forEach(async guild => {
            
                //Query swapi for guild profiles
                const players = await Bot.swapi.players( guild.members, ( player ) => {
                    return {
                        name: player.name,
                        ships: player.roster.filter(c => c.crew.length && c.nameKey.replace(/[-|']/g,"").toLowerCase().includes( charName.replace(/[-|']/g,"").toLowerCase() )),
                        updated: player.updated
                    }
                })

                //Accumulate units across guild                
                let units = []
                let defIds = []

                players.result.forEach(async player => {

                    if( player.ships.find(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === charName.replace(/[-|']/g,"").toLowerCase()) ) {
                        player.ships = player.ships.filter(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === charName.replace(/[-|']/g,"").toLowerCase())
                    }

                    player.ships.forEach(c => { 
                        if( !defIds.includes(c.defId) ) { defIds.push(c.defId) }
                    })
                    
                    units = units.concat( player.ships )
                    
                })    
                

                //Report
                
	            const embed = {
                    title : util.format(STRING.command.shipTitle, guild.name),
                    description : util.format(STRING.command.found, defIds.length),
                    color: 0x21CF47,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(guild.updated),
                    fields:[]
                }
                
                defIds.forEach(async id => {
                    
                    let thisUnits = units.filter(u => u.defId === id)
                    
                    embed.description += thisUnits[0].nameKey.toLowerCase().replace(charName, "**"+charName+"**")+'\n'

                    let field = {
                        name:thisUnits[0].nameKey,
                        value:util.format(STRING.command.foundName, thisUnits.length),
                        inline: true
                    }
                    
                    field.value += "★★★★★★★ : `"+thisUnits.filter(c => c.rarity === 7).length+"`\n"
                    field.value += "★★★★★★☆ : `"+thisUnits.filter(c => c.rarity === 6).length+"`\n"
                    field.value += "★★★★★☆☆ : `"+thisUnits.filter(c => c.rarity === 5).length+"`\n"
                    field.value += "★★★★☆☆☆ : `"+thisUnits.filter(c => c.rarity === 4).length+"`\n"
                    field.value += "★★★☆☆☆☆ : `"+thisUnits.filter(c => c.rarity === 3).length+"`\n"

                    field.value += "**"+STRING.command.fields.hardware3+"** : `"+thisUnits.reduce((acc,a) => {
                        return acc + a.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === 3).length
                    },0)+"`\n"
                                    
                    field.value += "**"+STRING.command.fields.hardware2+"** : `"+thisUnits.reduce((acc,a) => {
                        return acc + a.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === 2).length
                    },0)+"`\n"
                                    
                    field.value += "`------------------------------`\n"
                
                    embed.fields.push(field)
                    
                })

                embed.description += "`------------------------------`\n"

                await Bot.discord.util.reply.swapi(message, embed, {warning:guilds.warning, error:guilds.error}, MESSAGE)                
                MESSAGE = null
                
            })
            
        } else {
            await Bot.discord.util.reply.swapi(message, null, {warning:[], error:guilds.error}, MESSAGE)
            MESSAGE = null
        }
            
    } catch(error) {
        await Bot.discord.util.reply.error(message, error, MESSAGE)
    }
    
}

module.exports = {
    help:help,
    command:command
}
