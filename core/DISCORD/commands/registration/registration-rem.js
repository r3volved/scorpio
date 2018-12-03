const util = require('util')

const help = async ( message ) => {
	const embed = {
        title : OUTPUT["registration"].add.help.title,
        description : OUTPUT["registration"].add.help.description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[{
            name: OUTPUT["registration"].add.help.example.name,
            value: util.format( 
                OUTPUT["registration"].add.help.example.value,
                message.prefix+message.command
            )
        }]
    }
    message.channel.send({embed})
}


const command = async ( message ) => {

    let MESSAGE = null
    
    let register = null
    try {
	    register = await Bot.swapi.register({
	        del:[ message.author.id ]
	    });
	} catch(e) {
        return await Bot.discord.util.reply.error(message, e)
	}

	const embed = {
        title : "",
        description : "",
        color: 0xFFA900,
        timestamp: new Date(),
        fields:[]
    }
    
    if( register.error && register.error.length ) { 
        if( register.error.type === 'invalid-json' ) { 
            register.error.message = "API Error"
            register.error.error = register.error.message
            register.error.description = OUTPUT["registration"].error.noApi
        }
        return await Bot.discord.util.reply.error(message, register.error) 
    }
    
    if( register.result && register.result.length ) {
    
        register = register.result[0]

	    if( !register || !register.del || register.del.n === 0 ) {
	        embed.title = util.format( OUTPUT["registration"].rem.command.title, 'error' )
            embed.description = OUTPUT["registration"].rem.command.none
	    } else {
	        embed.title = util.format( OUTPUT["registration"].rem.command.title, 'updated' )
            embed.description = OUTPUT["registration"].rem.command.updated 
        }
    } else {
        embed.description += "**" + error[0].message + "** : " + error[0].description + "\n"
    }
    
	embed.description += '`------------------------------`\n',
        
	message.channel.send({embed})

}

module.exports = {
    help:help,
    command:command
}
