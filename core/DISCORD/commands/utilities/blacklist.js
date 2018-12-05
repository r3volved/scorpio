const help = async ( message ) => {
	const embed = {
        title : "Blacklist control",
        description : "Add discord id, or remove id from the blacklist",
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
            return message.reply('Please include an action [ add | rem ]')
        }
        
        let id = message.parts.slice(2).find(i => i.match(/^\d{17,18}$/))

        let embed = {
            title:"Blacklist updated",
            description:""
        }
        
        const fs = require('fs')
        switch( action[0].toLowerCase() ) {
            case "add":
                if( !id ) { return message.reply('Please include a discord id') }
                if( Bot.blacklist.indexOf(id) > -1 ) { return message.reply('This user is already blacklisted') }
                Bot.blacklist.push(id.toString())
                embed.description = id+" has been added to blacklist"
                break;
            case "rem":
                if( !id ) { return message.reply('Please include a discord id') }
                if( Bot.blacklist.indexOf(id) < 0 ) { return message.reply('This user is not blacklisted') }
                Bot.blacklist.splice( Bot.blacklist.indexOf(id), 1 )
                embed.description = id+" has been removed from blacklist"
                break;
            default:
                return message.reply('Unknown action "'+action[0]+'"')
        }
        
        fs.writeFileSync(Bot.root+Bot.config.discord.blacklist, JSON.stringify(Bot.blacklist,null,4), 'utf8') 
 
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
