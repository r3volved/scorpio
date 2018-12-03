const util = require('util')
const STRING = OUTPUT["guild-info"]

const help = async ( message ) => {
	const embed = {
        title : STRING.zetaHelp.title,
        description : STRING.zetaHelp.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name:STRING.zetaHelp.example.name,
            value:util.format( 
                STRING.zetaHelp.example.value,
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
                        characters: player.roster.filter(c => !c.crew.length),
                        updated: player.updated
                    }
                })
                
                let gzetas = {}
                players.result.forEach(async player => {

                    let zetas = player.characters.reduce((acc,a) => {
                        acc.push({name:a.nameKey,zetas:a.skills.filter(s => s.isZeta && s.tier === 8)})
                        return acc
                    },[]).filter(z => z.zetas.length > 0)
                
                    zetas.forEach( z => {
                        z.zetas.forEach( zz => {
                            gzetas[zz.nameKey] = gzetas[zz.nameKey] || 0
                            gzetas[zz.nameKey]++
                        })
                    })
                    
                })

                let zarr = Object.keys(gzetas).reduce((acc,z) => {
                    acc.push({name:z,num:gzetas[z]})
                    return acc
                },[])
                
                let total = zarr.reduce((acc,z) => {
                    return acc + z.num
                },0)

	            const embed = {
                    title : util.format(STRING.command.zetaTitle, guild.name),
                    description : util.format(STRING.command.foundZetas, total, Object.keys(gzetas).length),
                    color: 0x21CF47,
                    footer: {
                      text: STRING.command.updated
                    },
                    timestamp: new Date(guild.updated),
                    fields:[]
                }
                
                embed.description += "`------------------------------`\n"

                zarr.sort((a,b) => b.num - a.num)
                
                let i = 0
                while( zarr.length ) {
                    let group = zarr.splice(0, 20)
                    let field = {
                        name: ((i*20)+1)+"-"+((i*20)+group.length),
                        value: group.reduce((str,z) => {
                            return str + z.num + " x `" + z.name +"`\n"
                        },"") + "`------------------------------`\n",
                        inline: true
                    }
                    ++i
                    embed.fields.push(field)  

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
