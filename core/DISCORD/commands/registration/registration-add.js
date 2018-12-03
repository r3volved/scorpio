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
                message.prefix+message.command,
                message.prefix+message.command
            )
        }]
    }
    message.channel.send({embed})
}


const command = async ( message ) => {

    let MESSAGE = null
    
    let allycode = message.parts.slice(2).find(p => p.match(/^\d{3}-*\d{3}-*\d{3}$/))
        allycode = allycode ? Number(allycode.replace(/-/g,'')) : allycode

    let discord  = message.parts.slice(2).find(p => p.match(/\d{17,18}/) || p === 'me')
        discord  = !discord || discord === 'me' ? message.author.id : discord.replace(/[\<\@\!\>]/g,'')

    if( !discord || !allycode ) {
        await message.reply( OUTPUT["registration"].error.noAllycodeOrUser )
        return help( message )
    }    

    let register = null
    try {
	    register = await Bot.swapi.register({
	        put:[ [allycode, discord] ]
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
 
    if( register.result && register.result.length ) {
       
        register = register.result[0]
        
        if( register.error ) { 
            if( register.error.type === 'invalid-json' ) { 
                register.error.message = "API Error"
                register.error.error = register.error.message
                register.error.description = OUTPUT["registration"].error.noApi
            }
            return await Bot.discord.util.reply.error(message, register.error) 
        }
        
	    if( register.put[0].upserted ) {
	        embed.title = util.format( OUTPUT["registration"].add.command.title, 'successful' )
	        embed.description = util.format( OUTPUT["registration"].add.command.registered, register.get[0].allyCode, register.get[0].discordId )
	    } else {
	        
	        if( register.put[0].nModified > 0 ) {
	            embed.title = util.format( OUTPUT["registration"].add.command.title, 'updated' )
	            embed.description = util.format( OUTPUT["registration"].add.command.updated, register.get[0].allyCode, register.get[0].discordId )
	        } else {
	            embed.description = util.format( OUTPUT["registration"].add.command.noChange, register.get[0].allyCode, register.get[0].discordId )
	        }
	
	    }

    } else {
        embed.description = "**" + error[0].message + "** : " + error[0].description + "\n"
    }
    
    embed.description += '`------------------------------`\n',
    
	message.channel.send({embed})

}

module.exports = {
    help:help,
    command:command
}
