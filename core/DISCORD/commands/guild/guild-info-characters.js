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
                        characters: player.roster.filter(c => !c.crew.length && c.nameKey.replace(/[-|']/g,"").toLowerCase().includes( charName.replace(/[-|']/g,"").toLowerCase() )),
                        updated: player.updated
                    }
                })

                //Accumulate units across guild                
                let units = []
                let defIds = []

                players.result.forEach(async player => {

                    if( player.characters.find(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === charName.replace(/[-|']/g,"").toLowerCase()) ) {
                        player.characters = player.characters.filter(c => c.nameKey.replace(/[-|']/g,"").toLowerCase() === charName.replace(/[-|']/g,"").toLowerCase())
                    }

                    player.characters.forEach(c => { 
                        if( !defIds.includes(c.defId) ) { defIds.push(c.defId) }
                    })
                    
                    units = units.concat( player.characters )
                    
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
                
                defIds.forEach(async id => {
                    
                    let thisUnits = units.filter(u => u.defId === id)
                    
                    embed.description += thisUnits[0].nameKey.toLowerCase().replace(charName, "**"+charName+"**")+'\n'

                    let field = {
                        name:thisUnits[0].nameKey,
                        value:util.format(STRING.command.found, thisUnits.length),
                        inline: true
                    }
                    
                    field.value += "★★★★★★★ : `"+thisUnits.filter(c => c.rarity === 7).length+"`\n"
                    field.value += "★★★★★★☆ : `"+thisUnits.filter(c => c.rarity === 6).length+"`\n"
                    field.value += "★★★★★☆☆ : `"+thisUnits.filter(c => c.rarity === 5).length+"`\n"
                    field.value += "★★★★☆☆☆ : `"+thisUnits.filter(c => c.rarity === 4).length+"`\n"
                    field.value += "★★★☆☆☆☆ : `"+thisUnits.filter(c => c.rarity === 3).length+"`\n"

                    field.value += "**"+STRING.command.fields.zetas+"** : `"+thisUnits.reduce((acc,a) => {
                        return acc + a.skills.filter(s => s.isZeta && s.tier === 8).length
                    },0)+"`\n"
                                    
                    field.value += "**"+STRING.command.fields.gear12plus+"** : `"+thisUnits.filter(c => c.gear === 12 && c.equipped.length >= 3).length+"`\n"
                    field.value += "**"+STRING.command.fields.gear12+"** : `"+thisUnits.filter(c => c.gear === 12 && c.equipped.length < 3).length+"`\n"
                    field.value += "**"+STRING.command.fields.gear11+"** : `"+thisUnits.filter(c => c.gear === 11).length+"`\n"
                    field.value += "**"+STRING.command.fields.gear10+"** : `"+thisUnits.filter(c => c.gear === 10).length+"`\n"
                    
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
