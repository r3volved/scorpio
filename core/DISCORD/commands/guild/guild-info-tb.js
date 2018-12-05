const util = require('util')
const STRING = OUTPUT["guild-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.charHelp.title,
        description : STRING.charHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.charHelp.example.name,
            value:util.format( 
                STRING.charHelp.example.value,
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
            return message.reply(STRING.error.noCharacter)
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
                        roster: player.roster.filter(c => c.nameKey.replace(/[-|']/g,"").toLowerCase().includes( charName.replace(/[-|']/g,"").toLowerCase() )),
                        updated: player.updated
                    }
                })

                //Accumulate units across guild                
                let units = []
                let defIds = []

                players.result.forEach(async player => {

                    if( player.roster.find(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === charName.replace(/[-|']/g,"").toLowerCase()) ) {
                        player.roster = player.roster.filter(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === charName.replace(/[-|']/g,"").toLowerCase())
                    }

                    player.roster.forEach(c => { 
                        if( !defIds.includes(c.defId) ) { defIds.push(c.defId) }
                    })
                    
                    units = units.concat( player.roster )
                    
                })    
                

                //Report
                
	            const embed = {
                    title : util.format(STRING.command.charTitle, guild.name),
                    description : util.format(STRING.command.found, defIds.length),
                    color: 0x21CF47,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(guild.updated),
                    fields:[]
                }
                
                let flags = {}
                defIds.forEach(async id => {                    
                    let thisUnits = units.filter(u => u.defId === id)
                    embed.description += thisUnits[0].nameKey.toLowerCase().replace(charName, "**"+charName+"**")+'\n'
                    
                    if( thisUnits[0].nameKey.toLowerCase().split(/\s/g).includes(charName.toLowerCase()) ) {
                        flags.pcmatch = true
                    }
                                       
                })

                
                if( flags.pcmatch ) {
                    defIds = defIds.filter(id => {
                        let thisUnits = units.filter(u => u.defId === id)
                        return thisUnits[0].nameKey.toLowerCase().split(/\s/g).includes(charName.toLowerCase())
                    })
                }
                
                defIds.sort((a,b) => {
                    let au = units.filter(u => u.defId === a)
                    let bu = units.filter(u => u.defId === b)
                    return au[0].nameKey.toLowerCase().indexOf(charName.toLowerCase()) - bu[0].nameKey.toLowerCase().indexOf(charName.toLowerCase())
                }).sort((a,b) => {
                    let au = units.filter(u => u.defId === a)
                    let bu = units.filter(u => u.defId === b)
                    return au[0].nameKey.length - bu[0].nameKey.length
                })
                                

                if( !defIds.length ) { 
                    return message.reply("I could not find a good match")
                }

                let thisUnits = units.filter(u => u.defId === defIds[0])
                embed.description += "`------------------------------`\n"
                embed.description += "**Best match: "+thisUnits[0].nameKey+"**"
                
                for( let r = 7; r > 2; --r ) {
                
                    let field = {
                        name:"★".repeat(r)+"☆".repeat(7 - r),
                        value:players.result.map(p => {
                            let unit = p.roster.find(u => u.defId === defIds[0] && u.rarity === r)
                            return unit ? {
                                name:p.name,
                                gp:unit.gp
                            } : null
                        }).filter(u => u).sort((a,b) => b.gp - a.gp).reduce((str,p) => {
                            return str + p.gp.toLocaleString() + " : " + p.name + "\n"                    
                        },""),
                        inline: true
                    }
                    
                    if( field.value.length ) {
                        embed.fields.push(field)
                    }                    
                }
                
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
