const help = async ( message ) => {
	const embed = {
        title : "Premium control",
        description : "Add or remove id from the premium user list or update source url",
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[]
    }
    message.channel.send({embed})
}

const command = async ( message ) => {

    try {
    
        if( !Bot.config.discord.master.includes(message.author.id) ) {
            return message.reply('Sorry, this is a restricted feature')
        }
        
        let action = message.parts.slice(2).filter(i => i.length === 3)
        if( !action[0] ) { 
            return message.reply('Please include an action [ add | rem | url ]')
        }
        
        let id = message.parts.slice(2).find(i => i.match(/^\d{17,18}$/))

        let embed = {
            title:"Premium updated",
            description:""
        }
        
        const fs = require('fs')
        switch( action[0].toLowerCase() ) {
            case "url":
                let url = message.parts.slice(2).find(i => i !== id && i !== action[0])
                if( !url || !url.match(/^https*:\/\//) ) { return message.reply('Please include a valid url') }             
                Bot.premium.url = url
                embed.description = "Premium data source updated"
                break;
            case "add":
                if( !id ) { return message.reply('Please include a discord id') }
                if( Bot.premium.users.indexOf(id) > -1 ) { return message.reply('This user is already premium') }
                Bot.premium.users.push(id.toString())
                embed.description = id+" has been added to premium users"
                break;
            case "rem":
                if( !id ) { return message.reply('Please include a discord id') }
                if( Bot.premium.users.indexOf(id) < 0 ) { return message.reply('This user is not premium') }
                Bot.premium.users.splice( Bot.premium.users.indexOf(id), 1 )
                embed.description = id+" has been removed from premium users"
                break;
            default:
                return message.reply('Unknown action "'+action[0]+'"')
        }
        
        fs.writeFileSync(Bot.root+Bot.config.discord.premium, JSON.stringify(Bot.premium,null,4), 'utf8') 
 
        message.channel.send({embed})   
    
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
