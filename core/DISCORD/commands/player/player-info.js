const util = require('util')
const STRING = OUTPUT["player-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.help.title,
        description : STRING.help.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.help.example.name,
            value:util.format( 
                STRING.help.example.value,
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
            return {
                name: player.name,
                allyCode: player.allyCode,
                level: player.level,
                guildName: player.guildName,

                totalGP: player.stats[0],
                winsShip: player.stats[3],
                winsChar: player.stats[4],
                winsBattle: player.stats[5],
                winsHard: player.stats[6],
                winsGW: player.stats[7],
                winsRaid: player.stats[8],
                contribution: player.stats[9],
                donation: player.stats[10],
                
                characters: player.roster.filter(c => !c.crew.length),
                ships: player.roster.filter(c => c.crew.length),
                
                arena: player.arena,

                updated: (new Date(player.updated)).toLocaleString()
            }
        }
        
        //Query swapi for player profiles
        const { result, warning, error } = await Bot.swapi.players( allycodes, conversion )

        if( result.length ) { 

            //Echo each result
            result.forEach(async player => {
                
	            const embed = {
                    title : util.format( STRING.command.title, player.name, player.allyCode ),
                    description : '`------------------------------`\n',
                    color: 0x8B3CB7,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(player.updated),
                    fields:[]
                }
                
                embed.description += "**"+STRING.command.level+"**: `"+player.level+"`\n"
                embed.description += "**"+STRING.command.guild+"**: `"+(player.guildName || "—")+"`\n"
                embed.description += "**"+player.totalGP.nameKey+"**: `"+player.totalGP.value.toLocaleString()+"`\n"
                embed.description += "**"+player.winsShip.nameKey+"**: `"+player.winsShip.value.toLocaleString()+"`\n"
                embed.description += "**"+player.winsChar.nameKey+"**: `"+player.winsChar.value.toLocaleString()+"`\n"
                embed.description += "**"+player.winsBattle.nameKey+"**: `"+player.winsBattle.value.toLocaleString()+"`\n"
                embed.description += "**"+player.winsHard.nameKey+"**: `"+player.winsHard.value.toLocaleString()+"`\n"
                embed.description += "**"+player.winsGW.nameKey+"**: `"+player.winsGW.value.toLocaleString()+"`\n"
                embed.description += "**"+player.winsRaid.nameKey+"**: `"+player.winsRaid.value.toLocaleString()+"`\n"
                embed.description += "**"+player.contribution.nameKey+"**: `"+player.contribution.value.toLocaleString()+"`\n"
                embed.description += "**"+player.donation.nameKey+"**: `"+player.donation.value.toLocaleString()+"`\n"
                embed.description += '`------------------------------`\n'

                //Echo characters
                let fieldValue = ""
                fieldValue += "★★★★★★★ : `"+player.characters.filter(c => c.rarity === 7).length+"`\n"
                fieldValue += "★★★★★★☆ : `"+player.characters.filter(c => c.rarity === 6).length+"`\n"
                fieldValue += "★★★★★☆☆ : `"+player.characters.filter(c => c.rarity === 5).length+"`\n"
                fieldValue += "★★★★☆☆☆ : `"+player.characters.filter(c => c.rarity === 4).length+"`\n"
                fieldValue += "★★★☆☆☆☆ : `"+player.characters.filter(c => c.rarity === 3).length+"`\n"

                fieldValue += "**"+STRING.command.fields.arenaRank+"** : `"+(player.arena.char.rank || "—")+"`\n"

                fieldValue += "**"+STRING.command.fields.zetas+"** : `"+player.characters.reduce((acc,a) => {
                    return acc + a.skills.filter(s => s.isZeta && s.tier === 8).length
                },0)+"`\n"
                
                fieldValue += "**"+STRING.command.fields.mods+"** : `"+player.characters.reduce((acc,a) => {
                    return acc + a.mods.filter(m => Object.keys(m).length).length
                },0)+"`\n"
                
                fieldValue += "**"+STRING.command.fields.level+"** : `"+player.characters.filter(c => c.level === 85).length+"`\n"

                fieldValue += "**"+STRING.command.fields.gp+"** : `"+player.characters.reduce((acc,a) => {
                    return acc + a.gp
                },0).toLocaleString()+"`\n"
                
                fieldValue += "**"+STRING.command.fields.gear12plus+"** : `"+player.characters.filter(c => c.gear === 12 && c.equipped.length >= 3).length+"`\n"
                fieldValue += "**"+STRING.command.fields.gear12+"** : `"+player.characters.filter(c => c.gear === 12 && c.equipped.length < 3).length+"`\n"
                fieldValue += "**"+STRING.command.fields.gear11+"** : `"+player.characters.filter(c => c.gear === 11).length+"`\n"
                fieldValue += "**"+STRING.command.fields.gear10+"** : `"+player.characters.filter(c => c.gear === 10).length+"`\n"

                fieldValue += '`------------------------------`\n'
                
                embed.fields.push({
                    name:util.format( STRING.command.fields.char, player.characters.length ),
                    value:fieldValue,
                    inline:true
                })
                
                //Echo ships
                fieldValue = ""
                fieldValue += "★★★★★★★ : `"+player.ships.filter(c => c.rarity === 7).length+"`\n"
                fieldValue += "★★★★★★☆ : `"+player.ships.filter(c => c.rarity === 6).length+"`\n"
                fieldValue += "★★★★★☆☆ : `"+player.ships.filter(c => c.rarity === 5).length+"`\n"
                fieldValue += "★★★★☆☆☆ : `"+player.ships.filter(c => c.rarity === 4).length+"`\n"
                fieldValue += "★★★☆☆☆☆ : `"+player.ships.filter(c => c.rarity === 3).length+"`\n"

                fieldValue += "**"+STRING.command.fields.arenaRank+"** : `"+(player.arena.ship.rank || "Locked")+"`\n"

                fieldValue += "**"+STRING.command.fields.hardware3+"** : `"+player.ships.reduce((acc,a) => {
                    return acc + a.skills.filter(s => s.id.includes('hardware') && s.tier === 3).length
                },0)+"`\n"
                
                fieldValue += "**"+STRING.command.fields.hardware2+"** : `"+player.ships.reduce((acc,a) => {
                    return acc + a.skills.filter(s => s.id.includes('hardware') && s.tier === 2).length
                },0)+"`\n"
                
                fieldValue += "**"+STRING.command.fields.level+"** : `"+player.ships.filter(c => c.level === 85).length+"`\n"

                fieldValue += "**"+STRING.command.fields.gp+"** : `"+player.ships.reduce((acc,a) => {
                    return acc + a.gp
                },0).toLocaleString()+"`\n"
                                                    
                fieldValue += '`------------------------------`\n'
                
                embed.fields.push({
                    name:util.format( STRING.command.fields.ship, player.ships.length ),
                    value:fieldValue,
                    inline:true
                })
                

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
