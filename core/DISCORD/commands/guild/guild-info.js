const util = require('util')
const STRING = OUTPUT["guild-info"]

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
        
        //Send loading message
        MESSAGE = await Bot.discord.util.loading(message, {
            title:allycodes.length > 1 
                ? util.format(STRING.command.loading.guilds, allycodes.join(", "))
                : util.format(STRING.command.loading.guild, allycodes[0])
        })


        //Query swapi for guild profiles
        const { result, warning, error } = await Bot.swapi.guilds( allycodes, ( guild ) => {
            return guild
        })

        if( result.length ) { 

            //Echo each result
            result.forEach(async guild => {
            
	            const embed = {
                    title : util.format(STRING.command.title, guild.name),
                    description : '`------------------------------`\n',
                    color: 0x21CF47,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(guild.updated),
                    fields:[]
                }
                
                embed.description += guild.desc.length ? "**"+guild.desc+"**\n" : ""
                embed.description += guild.message.length ? "*"+guild.message+"*\n" : ""
                embed.description += '`------------------------------`\n'

                let TGP = guild.roster.reduce((sum,m) => { return sum + m.gp },0)
                let CGP = guild.roster.reduce((sum,m) => { return sum + m.gpChar },0)
                let SGP = guild.roster.reduce((sum,m) => { return sum + m.gpShip },0)

                embed.description += "**"+STRING.command.fields.gpTotal+"**: `"+TGP.toLocaleString()+"`\n"                
                embed.description += "**"+STRING.command.fields.gpChar+"**: `"+CGP.toLocaleString()+"`\n"
                embed.description += "**"+STRING.command.fields.gpShip+"**: `"+SGP.toLocaleString()+"`\n"
                
                let field = {
                    name:STRING.command.fields.raids,
                    value:"",
                    inline:true
                }

                let rancor = guild.raid.rancor ? guild.raid.rancor.replace(/80|85|DIFF/g,'').toLowerCase() : "—"
                field.value += "**"+STRING.command.fields.rancor+"**: "+rancor.charAt(0).toUpperCase()+rancor.slice(1)+"\n"

                let aat = guild.raid.aat ? guild.raid.aat.replace(/80|85|DIFF/g,'').toLowerCase() : "—"
                field.value += "**"+STRING.command.fields.aat+"**: "+aat.charAt(0).toUpperCase()+aat.slice(1)+"\n"

                let sith = guild.raid.sith_raid ? guild.raid.sith_raid.replace(/80|85|DIFF/g,'').toLowerCase() : "—"
                field.value += "**"+STRING.command.fields.sith+"**: "+sith.charAt(0).toUpperCase()+sith.slice(1)+"\n"

                field.value += '`------------------------------`\n'
                embed.fields.push(field)

                field = {
                    name:STRING.command.fields.details,
                    value:"",
                    inline:true
                }

                const status = STRING.guildStatus
                field.value += "**"+STRING.command.fields.status+"**: "+status[guild.status]+"\n"
                field.value += "**"+STRING.command.fields.required+"**: L"+guild.required+"\n"
                field.value += "**"+STRING.command.fields.members+"**: "+guild.members+" / 50\n"

                field.value += '`------------------------------`\n'
                embed.fields.push(field)

                const levels = STRING.guildMemberTypes


                guild.roster.sort((a,b) => b.guildMemberLevel - a.guildMemberLevel)
                
                //First half roaster
                let firstHalf = guild.roster.splice(0,Math.ceil(guild.roster.length / 2))
                field = {
                    name:STRING.command.fields.members+" 1-"+firstHalf.length,
                    value:"",
                    inline:true
                }

                firstHalf.forEach( member => {
                    field.value += "`"+member.allyCode+"` `["+levels[member.guildMemberLevel].charAt(0)+"]` "
                    const name = allycodes.includes(member.allyCode) ? "**"+member.name+"**" : member.name
                    field.value += name+"\n"               
                })
                field.value += '`------------------------------`\n'
                embed.fields.push(field)

                //Second half roster
                field = {
                    name:STRING.command.fields.members+" "+(firstHalf.length+1)+"-"+guild.members,
                    value:"",
                    inline:true
                }

                guild.roster.forEach( member => {
                    field.value += "`"+member.allyCode+"` `["+levels[member.guildMemberLevel].charAt(0)+"]` "
                    const name = allycodes.includes(member.allyCode) ? "**"+member.name+"**" : member.name
                    field.value += name+"\n"               
                })

                field.value += '`------------------------------`\n'
                embed.fields.push(field)

                await Bot.discord.util.reply.swapi(message, embed, {warning:warning, error:error}, MESSAGE)
                MESSAGE = null
                
            })
            
        } else {
            await Bot.discord.util.reply.swapi(message, null, {warning:[], error:error}, MESSAGE)
            MESSAGE = null
        }
            
    } catch(error) {
        console.error(error)
        await Bot.discord.util.reply.error(message, error, MESSAGE)
        MESSAGE = null
    }
    
}

module.exports = {
    help:help,
    command:command
}
