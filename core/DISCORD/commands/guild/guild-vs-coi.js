const util = require('util')
const STRING = OUTPUT["guild-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.vsCoiHelp.title,
        description : STRING.vsCoiHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.vsCoiHelp.example.name,
            value:util.format( 
                STRING.vsCoiHelp.example.value,
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
        if( allycodes.length !== 2 ) {
            let e = new Error(STRING.error.twoGuildsTitle)
                e.description = util.format(STRING.error.twoGuilds, allycodes.length, allycodes.join(", "))
            throw e
        }
        
        //Send loading message
        MESSAGE = await Bot.discord.util.loading(message, {
            title:allycodes.length > 1 
                ? util.format(STRING.command.loading.guilds, allycodes.join(", "))
                : util.format(STRING.command.loading.guild, allycodes[0])
        }, MESSAGE)


        //Query swapi for guild profiles
        const guilds = await Bot.swapi.guilds( allycodes, ( guild ) => {
            return guild
        })
        let warnings = guilds.warning
        let errors   = guilds.error

        if( guilds.result.length ) { 

            let summaries = []
                        
            //Send loading message
            MESSAGE = await Bot.discord.util.loading(message, {
                title:STRING.command.loading.updating,
                description:util.format(STRING.command.loading.foundGuilds, guilds.result.reduce((str,g) => { return str ? str+" & **"+g.name+"**" : "**"+g.name+"**" },null))
            }, MESSAGE)

            //Calculate summaries
            guilds.result.forEach(async guild => {
            
                //Build member-allycode index

                summaries.push(new Promise(async (resolve,reject) => {

                    //Build summary
                    const summary = {
                        name:guild.name,
                        members:guild.members,
                        roster:guild.roster,
                        gp:guild.gp,
                        updated:new Date(guild.updated).toLocaleString()
                    }
                                        
                    //Query swapi for members
                    const members = await Bot.swapi.players( guild.roster.map(r => r.allyCode), ( player ) => {
                        return player
                    })                    
                    
                    warnings = warnings.concat(members.warning)
                    errors   = errors.concat(members.error)
                    
                    summary.gpChar = guild.roster.reduce((sum,m) => {
                        return sum + m.gpChar
                    },0)
                    summary.gpShip = guild.roster.reduce((sum,m) => {
                        return sum + m.gpShip
                    },0)
                    summary.gp = summary.gpChar + summary.gpShip

                    
                    //CHARACTERS
                    summary.star7c = Bot.swapi.util.guild.sum.rarity( members.result, 7, false )
                    summary.star6c = Bot.swapi.util.guild.sum.rarity( members.result, 6, false )
                    summary.star5c = summary.gp > 120000000 ? null : Bot.swapi.util.guild.sum.rarity( members.result, 5, false )
                    summary.star0c = summary.gp > 120000000 ? null : Bot.swapi.util.guild.sum.rarity( members.result, 4, false ) + Bot.swapi.util.guild.sum.rarity( members.result, 3, false ) + Bot.swapi.util.guild.sum.rarity( members.result, 2, false )
                    
                    summary.gear12p = Bot.swapi.util.guild.sum.gear( members.result, 12, 3 )
                    summary.gear12  = Bot.swapi.util.guild.sum.gear( members.result, 12 ) - summary.gear12p
                    summary.gear11  = Bot.swapi.util.guild.sum.gear( members.result, 11 )
                    summary.gear10  = Bot.swapi.util.guild.sum.gear( members.result, 10 )
                    
                    summary.zetas = Bot.swapi.util.guild.sum.zetas( members.result )

                    summary.mods30p = Bot.swapi.util.guild.sum.mods( members.result, 5, [31,50], 1 )
                    summary.mods30  = Bot.swapi.util.guild.sum.mods( members.result, 5, [30,31], 1 )
                    summary.mods25p = Bot.swapi.util.guild.sum.mods( members.result, 5, [25,50], 2 )
                    summary.mods20  = Bot.swapi.util.guild.sum.mods( members.result, 5, [20,25], 2 )
                    

                    summary.modsSixDot = members.result.reduce((res,a) => { 
                        return res + a.roster.reduce((sum,u) => { 
                            return sum + u.mods.filter(m => m.pips === 6).length
                        },0 ) 
                    },0)


                    //SHIPS
                    summary.star7s = Bot.swapi.util.guild.sum.rarity( members.result, 7, true )
                    summary.star6s = Bot.swapi.util.guild.sum.rarity( members.result, 6, true )
                    summary.star5s = summary.gp > 120000000 ? null : Bot.swapi.util.guild.sum.rarity( members.result, 5, true )
                    summary.star0s = summary.gp > 120000000 ? null : Bot.swapi.util.guild.sum.rarity( members.result, 4, true ) + Bot.swapi.util.guild.sum.rarity( members.result, 3, true ) + Bot.swapi.util.guild.sum.rarity( members.result, 2, true )

                    summary.hw3 = Bot.swapi.util.guild.sum.hardware( members.result, 3 )
                    summary.hw2 = Bot.swapi.util.guild.sum.hardware( members.result, 2 )
                    
                    
                    //COI
                    summary.coi = {}
                    coi.forEach( c => {
                    
                        let units = members.result.reduce((res,p) => { 
                            memberUnit = p.roster.find(u => u.defId === c)
                            if( memberUnit ) { res.push(memberUnit) }
                            return res
                        },[])
                        
                        if( !units.length ) return null
                                                    
                        let avgGP = (units.reduce((sum,c) => {
                            return sum + c.gp
                        },0) / units.length)
                        
                        summary.coi[c] = {
                            name: units[0].nameKey,
                            defId: c,
                            count: units.length,
                            zetas: units.reduce((sum,c) => { return sum + c.skills.filter(s => s.isZeta && s.tier === 8).length },0),
                            stars: [
                                0,
                                Bot.swapi.util.roster.filter.rarity(units, 1).length,
                                Bot.swapi.util.roster.filter.rarity(units, 2).length,
                                Bot.swapi.util.roster.filter.rarity(units, 3).length,
                                Bot.swapi.util.roster.filter.rarity(units, 4).length,
                                Bot.swapi.util.roster.filter.rarity(units, 5).length,
                                Bot.swapi.util.roster.filter.rarity(units, 6).length,
                                Bot.swapi.util.roster.filter.rarity(units, 7).length
                            ],
                            gear: [
                                0,
                                Bot.swapi.util.roster.filter.gear(units, 1).length,
                                Bot.swapi.util.roster.filter.gear(units, 2).length,
                                Bot.swapi.util.roster.filter.gear(units, 3).length,
                                Bot.swapi.util.roster.filter.gear(units, 4).length,
                                Bot.swapi.util.roster.filter.gear(units, 5).length,
                                Bot.swapi.util.roster.filter.gear(units, 6).length,
                                Bot.swapi.util.roster.filter.gear(units, 7).length,
                                Bot.swapi.util.roster.filter.gear(units, 8).length,
                                Bot.swapi.util.roster.filter.gear(units, 9).length,
                                Bot.swapi.util.roster.filter.gear(units, 10).length,
                                Bot.swapi.util.roster.filter.gear(units, 11).length,
                                Bot.swapi.util.roster.filter.gear(units, 12, 3).length - Bot.swapi.util.roster.filter.gear(units, 12, 3).length,
                                Bot.swapi.util.roster.filter.gear(units, 12, 3).length
                            ],
                            avgGP: avgGP,
                            uppGP: units.reduce((sum,c) => {
                                return c.gp > avgGP ? sum + c.gp : sum
                            },0),
                            lowGP: units.reduce((sum,c) => {
                                return c.gp < avgGP ? sum + c.gp : sum
                            },0),
                            maxGP: (units.sort((a,b) => b.gp - a.gp)[0]).gp,
                            minGP: (units.sort((a,b) => a.gp - b.gp)[0]).gp
                            
                        }
                    
                    })

                    summary.soi = {}
                    soi.forEach( c => {
                    
                        let units = members.result.reduce((res,p) => { 
                            memberUnit = p.roster.find(u => u.defId === c)
                            if( memberUnit ) { res.push(memberUnit) }
                            return res
                        },[])
                        
                        if( !units.length ) return null
                                                    
                        let avgGP = (units.reduce((sum,c) => {
                            return sum + c.gp
                        },0) / units.length)
                        
                        summary.soi[c] = {
                            name: units[0].nameKey,
                            defId: c,
                            count: units.length,
                            stars: [
                                0,
                                units.filter(c => c.rarity === 1).length,
                                units.filter(c => c.rarity === 2).length,
                                units.filter(c => c.rarity === 3).length,
                                units.filter(c => c.rarity === 4).length,
                                units.filter(c => c.rarity === 5).length,
                                units.filter(c => c.rarity === 6).length,
                                units.filter(c => c.rarity === 7).length
                            ],
                            avgGP: avgGP,
                            uppGP: units.reduce((sum,c) => {
                                return c.gp > avgGP ? sum + c.gp : sum
                            },0),
                            lowGP: units.reduce((sum,c) => {
                                return c.gp < avgGP ? sum + c.gp : sum
                            },0),
                            maxGP: (units.sort((a,b) => b.gp - a.gp)[0]).gp,
                            minGP: (units.sort((a,b) => a.gp - b.gp)[0]).gp,
                            hw:[
                                0,
                                units.length - units.reduce((sum,c) => { return sum + c.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === 2).length },0) - units.reduce((sum,c) => { return sum + c.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === 3).length },0),
                                units.reduce((sum,c) => { return sum + c.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === 2).length },0),
                                units.reduce((sum,c) => { return sum + c.skills.filter(s => s.id.toLowerCase().includes('hardware') && s.tier === 3).length },0),
                            ],
                            pilot: units.reduce((sum,c) => { return sum + c.crew.map(cr => cr.cp) },0)
                            
                        }
                    
                    })

                    resolve(summary)

                }))                

            })

            summaries = await Promise.all( summaries )
            
            //Flag wins/loss
            Object.keys(summaries[0]).forEach(s => {
                if( Number(summaries[1][s]) && !Number(summaries[0][s]) ) summaries[0][s] = 0
                if( Number(summaries[0][s]) && !Number(summaries[1][s]) ) summaries[1][s] = 0
                if( Number(summaries[0][s]) ) {
                    if( Number(summaries[0][s]) > Number(summaries[1][s]) ) { 
                        summaries[0][s] = summaries[0][s].toLocaleString()+" ▲"
                        summaries[1][s] = summaries[1][s].toLocaleString() //+" ▼"
                    } else if( Number(summaries[0][s]) < Number(summaries[1][s]) ) { 
                        summaries[1][s] = summaries[1][s].toLocaleString()+" ▲"
                        summaries[0][s] = summaries[0][s].toLocaleString() //+" ▼"
                    } else {
                        summaries[0][s] = summaries[0][s].toLocaleString() //+" ●"
                        summaries[1][s] = summaries[1][s].toLocaleString() //+" ●"
                    }
                }
            })

            //REPORT UNITS OF INTEREST
            let fields = [{
                name:summaries[0].name,
                value:"",
                inline:true
            },{
                name:summaries[1].name,
                value:"",
                inline:true
            }]

            fields[0].value += "__"+STRING.command.fields.characters+"__\n"
            fields[1].value += "__"+STRING.command.fields.characters+"__\n"

            coi.forEach(s => {

                let u1 = summaries[0].coi[s]
                let u2 = summaries[1].coi[s]
                let s1 = ""
                let s2 = ""
                
                if( u1 || u2 ) {
                    
                    u1 = u1 || {}
                    u2 = u2 || {}
                
                    fields[0].value += "**"+(u1.count || 0)+" × "+(u1.name || u2.name)+"**\n" 
                    fields[1].value += "**"+(u2.count || 0)+" × "+(u2.name || u1.name)+"**\n"

                    s1 = !u1.gear ? 0 : Math.round(((u1.gear[13] || 0)*13)+((u1.gear[12] || 0)*12)+((u1.gear[11] || 0)*11)+((u1.gear[10] || 0)*10))
                    s2 = !u2.gear ? 0 : Math.round(((u2.gear[13] || 0)*13)+((u2.gear[12] || 0)*12)+((u2.gear[11] || 0)*11)+((u2.gear[10] || 0)*10))
                    
                    fields[0].value += s1 > s2 ? "[G:▲] " : "[G:—] "
                    fields[1].value += s2 > s1 ? "[G:▲] " : "[G:—] "
                    
                    fields[0].value += u1.zetas > u2.zetas ? "[Z:▲] " : "[Z:—] "
                    fields[1].value += u2.zetas > u1.zetas ? "[Z:▲] " : "[Z:—] "
                    
                    s1 = !u1.stars ? 0 : ((u1.stars[7] || 0)*7)+((u1.stars[6] || 0)*6)+((u1.stars[5] || 0)*5)+((u1.stars[4] || 0)*4)
                    s2 = !u2.stars ? 0 : ((u2.stars[7] || 0)*7)+((u2.stars[6] || 0)*6)+((u2.stars[5] || 0)*5)+((u2.stars[4] || 0)*4)
                    
                    fields[0].value += s1 > s2 ? "[☆:▲] " : "[☆:—] "
                    fields[1].value += s2 > s1 ? "[☆:▲] " : "[☆:—] "
                    
                    fields[0].value += "\n"
                    fields[1].value += "\n"
                    
                }
                
            })
            fields[0].value += '`------------------------------`\n'
            fields[1].value += '`------------------------------`\n'

            fields[0].value += "__"+STRING.command.fields.ships+"__\n"
            fields[1].value += "__"+STRING.command.fields.ships+"__\n"

            soi.forEach(s => {

                u1 = summaries[0].soi[s]
                u2 = summaries[1].soi[s]

                if( u1 || u2 ) {
                
                    u1 = u1 || {}
                    u2 = u2 || {}
                
                    fields[0].value += "**"+(u1.count || 0)+" × "+(u1.name || u2.name)+"**\n" 
                    fields[1].value += "**"+(u2.count || 0)+" × "+(u2.name || u1.name)+"**\n"

                    fields[0].value += u1.pilot > u2.pilot ? "["+STRING.command.fields.pilot+":▲] " : "["+STRING.command.fields.pilot+":—] "
                    fields[1].value += u2.pilot > u1.pilot ? "["+STRING.command.fields.pilot+":▲] " : "["+STRING.command.fields.pilot+":—] "

                    s1 = !u1.hw ? 0 : Math.round(((u1.hw[3] || 0)*3)+((u1.hw[2] || 0)*2))
                    s2 = !u2.hw ? 0 : Math.round(((u2.hw[3] || 0)*3)+((u2.hw[2] || 0)*2))
                    
                    fields[0].value += s1 > s2 ? "[HW:▲] " : "[HW:—] "
                    fields[1].value += s2 > s1 ? "[HW:▲] " : "[HW:—] "

                    s1 = !u1.stars ? 0 : ((u1.stars[7] || 0)*7)+((u1.stars[6] || 0)*6)+((u1.stars[5] || 0)*5)+((u1.stars[4] || 0)*4)
                    s2 = !u2.stars ? 0 : ((u2.stars[7] || 0)*7)+((u2.stars[6] || 0)*6)+((u2.stars[5] || 0)*5)+((u2.stars[4] || 0)*4)
                    
                    fields[0].value += s1 > s2 ? "[☆:▲] " : "[☆:—] "
                    fields[1].value += s2 > s1 ? "[☆:▲] " : "[☆:—] "
                    
                    fields[0].value += "\n"
                    fields[1].value += "\n"
                    
                }

            })
            fields[0].value += '`------------------------------`\n'
            fields[1].value += '`------------------------------`\n'
                
            let embed = {
                title : summaries[0].name+" -vs- "+summaries[1].name,
                description : STRING.command.unitsTitle,
                color: 0x21CF47,
                footer: { text: STRING.command.fields.queried },
                timestamp: new Date(),
                fields:fields
            }
            
            embed.description += "`------------------------------`\n",
            
            await Bot.discord.util.reply.swapi(message, embed, {warning:warnings, error:errors}, MESSAGE)
            MESSAGE = null
            
            
        } else {
            await Bot.discord.util.reply.swapi(message, null, {warning:warnings, error:errors}, MESSAGE)
            MESSAGE = null
        }
            
    } catch(error) {
        Report.error(error)
        await Bot.discord.util.reply.error(message, error, MESSAGE)
        return help( message )
    }
    
}

const coi = [
    "KYLORENUNMASKED",
    "BASTILASHANDARK",
    "IMPERIALPROBEDROID",
    "JEDIKNIGHTREVAN",
    "REYJEDITRAINING",
    "ENFYSNEST",
    "BASTILASHAN",
    "DARTHTRAYA",
    "COUNTDOOKU",
    "DARTHSION",
    "QIRA",
    "BOSSK",
    "BB8"
]

const soi = [
    "HOUNDSTOOTH",
    "XANADUBLOOD",
    "SITHBOMBER",
    "IG2000",
    "JEDISTARFIGHTERANAKIN"
]

module.exports = {
    help:help,
    command:command
}
