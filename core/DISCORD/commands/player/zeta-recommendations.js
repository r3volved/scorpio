const util = require('util')
const STRING = OUTPUT["player-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.zetaRecommendHelp.title,
        description : STRING.zetaRecommendHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.zetaRecommendHelp.example.name,
            value:util.format( 
                STRING.zetaRecommendHelp.example.value,
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
        const players = await Bot.swapi.players( allycodes, conversion )

        if( players.result.length ) { 

            //Send loading message
            MESSAGE = await Bot.discord.util.loading(message, {
                title:allycodes.length > 1 
                    ? util.format(STRING.command.loading.zetaRosters, allycodes.join(", "))
                    : util.format(STRING.command.loading.zetaRoster, allycodes[0])
            })

            const recommendations = await Bot.swapi.zetas()
            const warning = players.warning.concat( recommendations.warning )
            const error = players.error.concat( recommendations.error )
            
            if( recommendations.result.length ) {
                
                const zetas = recommendations.result[0].zetas
            
                let flags = message.parts.slice(2).filter(m => Object.keys(zetas[0]).includes(m.toLowerCase())).map(f => f.toLowerCase())
                if( !flags.length ) { flags.push("versa") }

                //Echo each result
                players.result.forEach(async player => {
                
                    let available = player.characters.reduce((acc,c) => {
                        //Basic unit ranking
                        let zs = c.skills.filter(s => s.isZeta && s.tier < 8)
                        zs.forEach( zz => {
                            let zrank = zetas.find(zr => zr.id === zz.id)
                            if( zrank ) {
                                let charRank = {
                                    name:c.nameKey,
                                    level:(c.level/85),
                                    rarity:(c.rarity/7),
                                    gear:(((c.gear*6)+c.equipped.length)/(13*6)),
                                    zeta:zz,
                                    ranks:flags.map(f => {
                                        return (zrank[f]/10)
                                    })
                                }
                                acc.push( charRank )
                            }
                        })
                        return acc
                    },[])
                    
                    //console.log( available )
                    available.sort((a,b) => {
                        let arank = (a.ranks.reduce((sum,r) => { return sum + r },0) / a.ranks.length)
                            arank = ((a.level+a.rarity+a.gear)/3) - arank
                        let brank = (b.ranks.reduce((sum,r) => { return sum + r },0) / b.ranks.length)
                            brank = ((b.level+b.rarity+b.gear)/3) - brank
                        return brank - arank
                    })
                                                
	                const embed = {
                        title : util.format(STRING.command.zetaRecommendTitle, player.name, player.allyCode),
                        description : "`------------------------------`\n",
                        color: 0x8B3CB7,
                        footer: {
                          text: STRING.command.updated
                        },
                        timestamp: new Date(player.updated),
                        fields:[]
                    }
                    
                    embed.description += STRING.command.fields.zRank
                    embed.description += util.format(STRING.command.fields.zScore, flags.join(" + "))
                    embed.description += STRING.command.fields.zCriteria
                    embed.description += "`------------------------------`\n"
                    
                    let max = 0
                    for( let i = 0; i < 20; i++ ) {
                        if( !available[i] ) { break }
                        let r = (available[i].ranks.reduce((sum,r) => { return sum + r },0) / available[i].ranks.length)
                            r = ((available[i].level+available[i].rarity+available[i].gear)/3) - r
                        
                        max = r > max ? r : max
                        embed.description += "`"+(r/max).toFixed(1)+"` : **"+available[i].name+"** : *"+available[i].zeta.nameKey+"*\n"
                    }
                    
                    embed.description += "`------------------------------`\n"
                    embed.description += STRING.command.fields.zScale
                    
                    await Bot.discord.util.reply.swapi(message, embed, {warning:warning, error:error}, MESSAGE)
                    MESSAGE = null

                })
            
            } else {
                await Bot.discord.util.reply.swapi(message, null, {warning:[], error:error}, MESSAGE)
                MESSAGE = null
            }
                
        } else {
            await Bot.discord.util.reply.swapi(message, null, {warning:[], error:players.error})
            MESSAGE = null
        }
            
    } catch(error) {
        //console.error(error)
        await Bot.discord.util.reply.error(message, error)
    }
    
}

module.exports = {
    help:help,
    command:command
}
