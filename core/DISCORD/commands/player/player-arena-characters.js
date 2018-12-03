const util = require('util')
const STRING = OUTPUT["player-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.charArenaHelp.title,
        description : STRING.charArenaHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.charArenaHelp.example.name,
            value:util.format( 
                STRING.charArenaHelp.example.value,
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
            const arenaIds = player.arena.char.squad.map(c => c.defId)
            return {
                name: player.name,
                allyCode: player.allyCode,
                characters: player.roster.filter(c => !c.crew.length && arenaIds.includes(c.defId)),
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
                    title : util.format( STRING.command.charArenaTitle, player.name, player.allyCode),
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
                
                player.arena.char.squad.forEach(async unit => {
                    let c = player.characters.find(r => r.defId === unit.defId)
                    let field = {
                        name:c.nameKey,
                        value:"",
                        inline:true                        
                    }
                    
                    field.value += "★".repeat(c.rarity)+"☆".repeat(7 - c.rarity)+" **| "
                    field.value += "L"+c.level+" | "
                    field.value += "G"+c.gear+" "
                    
                    let dots = c.equipped.reduce((dots,d) => {
                        dots[d.slot] = 1
                        return dots
                    },[0,0,0,0,0,0]).join("")
                    field.value += Bot.swapi.util.mod.dots[dots.toString()]+"**\n"
                
                    field.value += "**"+types[unit.squadUnitType]+"** | **GP**: `"+c.gp.toLocaleString()+"`\n"
                    gp += c.gp

                    field.value += c.skills.reduce((str,s) => {
                        if( !s.isZeta ) { return str }
                        return str + "**"+s.tier+"** : *"+s.nameKey+"* "+(s.isZeta ? s.tier === 8 ? "✦" : "⟡" : "")+"\n"
                    },"")

                    let speed = 0 
                    let offense = 0
                    let offensep = 0
                    let sset = 0
                    let msset = 0
                    let oset = 0
                    let moset = 0
                    
                    for( let i = 0; i < 6; i++ ) {
                        
                        if( !c.mods[i] ) {
                            field.value += i % 2 ? "—`\n" : "`—"+Bot.swapi.util.mod.dots["000000"].repeat(9)
                            continue
                        }

                        let pips = c.mods[i].level+"-"+c.mods[i].tier+" "+"•".repeat(c.mods[i].pips)+"-".repeat(6 - c.mods[i].pips)
                        field.value += i % 2 ? pips+"`\n" : "`"+pips+Bot.swapi.util.mod.dots["000000"].repeat(13 - pips.length)
                                                                 
                        //Report speed
                        if( c.mods[i].primaryStat.unitStat === 5 ) { speed += Number(c.mods[i].primaryStat.value) }
                        c.mods[i].secondaryStat.forEach(ms => {
                           if( ms.unitStat === 5 ) { speed += Number(ms.value) }
                        })
                        if( c.mods[i].set === 4 && c.mods[i].level < 15 ) { sset++ }
                        if( c.mods[i].set === 4 && c.mods[i].level === 15 ) { msset++ }

                        //Report offense
                        if( c.mods[i].primaryStat.unitStat === 41 ) { offense += Number(c.mods[i].primaryStat.value) }
                        c.mods[i].secondaryStat.forEach(ms => {
                           if( ms.unitStat === 41 ) { offense += Number(ms.value) }
                        })
                        if( c.mods[i].primaryStat.unitStat === 48 ) { offensep += Number(c.mods[i].primaryStat.value) }
                        c.mods[i].secondaryStat.forEach(ms => {
                           if( ms.unitStat === 48 ) { offensep += Number(ms.value) }
                        })
                        if( c.mods[i].set === 2 && c.mods[i].level < 15 ) { oset++ }
                        if( c.mods[i].set === 2 && c.mods[i].level === 15 ) { moset++ }

                    }


                    field.value += "`"+STRING.command.fields.offense+": +"+offense+", +"+offensep.toFixed(2)+"% "
                    if( oset >= 4 ) { field.value += "(+7.5% "+STRING.command.fields.bonus+")" }
                    if( moset >= 4 ) { field.value += "(+15% "+STRING.command.fields.bonus+")" }
                    field.value += "`\n"

                    field.value += "`"+STRING.command.fields.speed+": +"+speed+" "
                    if( sset >= 4 ) { field.value += "(+5% "+STRING.command.fields.bonus+")" }
                    if( msset >= 4 ) { field.value += "(+10% "+STRING.command.fields.bonus+")" }
                    field.value += "`\n"

                    field.value += '`--------------------------------`\n'

                    embed.fields.push( field )
                
                })                

                embed.description += "**"+STRING.command.fields.gp+"** : "+gp.toLocaleString()+"\n"
                embed.description += "**"+STRING.command.fields.arenaRank+"**: "+player.arena.char.rank+"\n"
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
