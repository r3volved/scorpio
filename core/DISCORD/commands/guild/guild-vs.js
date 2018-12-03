const util = require('util')
const STRING = OUTPUT["guild-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.vsHelp.title,
        description : STRING.vsHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.vsHelp.example.name,
            value:util.format( 
                STRING.vsHelp.example.value,
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

            //Report 
            let embed = {
                title : summaries[0].name+" -vs- "+summaries[1].name,
                description : '`------------------------------`\n',
                color: 0x21CF47,
                footer: { text: STRING.command.fields.queried },
                timestamp: new Date(),
                fields:[]
            }
            

            summaries.forEach(s => {
                
                let field = {
                    name:s.name,
                    value:"",
                    inline:true
                }
            
                //Report summaries
                field.value += "**"+STRING.command.fields.leader+"** : "+s.roster.find(m => m.guildMemberLevel === 4).name+"\n"
                field.value += "**"+STRING.command.fields.officers+"** : "+s.roster.filter(m => m.guildMemberLevel === 3).length+"\n"

                field.value += "**"+STRING.command.fields.members+"** : "+s.members+"\n"
                field.value += "**"+STRING.command.updated+"**: `"+s.updated.split(/\s/)[1]+"`\n"
                field.value += "`------------------------------`\n"
                
                field.value += "__"+STRING.command.fields.characters+"__\n"
                field.value += "**"+STRING.command.fields.gpChar+"** : "+s.gpChar+"\n"
                field.value += "**7★ "+STRING.command.fields.units+"** × "+s.star7c+"\n"
                field.value += "**6★ "+STRING.command.fields.units+"** × "+s.star6c+"\n"
                field.value += s.star5c ? "**5★ "+STRING.command.fields.units+"** × "+s.star5c+"\n" : ""
                field.value += s.star0c ? "**<5★ "+STRING.command.fields.units+"** × "+s.star0c+"\n" : ""
                field.value += s.gear12p ? "**"+STRING.command.fields.gear12plus+"** × "+s.gear12p+"\n" : ""
                field.value += s.gear12 ? "**"+STRING.command.fields.gear12+"** × "+s.gear12+"\n" : ""
                field.value += s.gear11 ? "**"+STRING.command.fields.gear11+"** × "+s.gear11+"\n" : ""
                field.value += s.gear10 ? "**"+STRING.command.fields.gear10+"** × "+s.gear10+"\n" : ""
                field.value += "**"+STRING.command.fields.zetas+"** : "+s.zetas+"\n"
                field.value += "**"+STRING.command.fields.plus30SpeedPrimary+"** × "+s.mods30p+"\n"
                field.value += "**"+STRING.command.fields.equal30SpeedPrimary+"** × "+s.mods30+"\n"
                field.value += "**"+STRING.command.fields.plus25SpeedSecondary+"** × "+s.mods25p+"\n"
                field.value += "**"+STRING.command.fields.plus20SpeedSecondary+"** × "+s.mods20+"\n"
                field.value += "**"+STRING.command.fields.sixDotMods+"** × "+s.modsSixDot+"\n"

                field.value += "`------------------------------`\n"
                
                field.value += "__"+STRING.command.fields.ships+"__\n"
                field.value += "**"+STRING.command.fields.gpShip+"** : "+s.gpShip+"\n"
                field.value += "**7★ "+STRING.command.fields.ships+"** × "+s.star7s+"\n"
                field.value += "**6★ "+STRING.command.fields.ships+"** × "+s.star6s+"\n"
                field.value += s.star5s ? "**5★ "+STRING.command.fields.ships+"** × "+s.star5s+"\n" : ""
                field.value += s.star0s ? "**<5★ "+STRING.command.fields.ships+"** × "+s.star0s+"\n" : ""
                field.value += "**"+STRING.command.fields.hardware3+"** × "+s.hw3+"\n"
                field.value += "**"+STRING.command.fields.hardware2+"** × "+s.hw2+"\n"
                
                field.value += "`------------------------------`\n"
                field.value += "**"+STRING.command.fields.gpTotal+"** : "+s.gp+"\n"
                
                let str = JSON.stringify(s)
                field.value += "**"+STRING.command.fields.sum+"** : **"+(str.match(/▲/g) || []).length+"** ▲\n"

                field.value += "`------------------------------`\n"

                embed.fields.push( field )
                
            })

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
