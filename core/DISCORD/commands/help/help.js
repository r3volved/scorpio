const util = require('util')

const help = async ( message ) => {
    message.parts = message.parts.splice(0,2)
    return command( message )
}


const command = async ( message ) => {

    let MESSAGE = null
    
    if( message.parts[2] ) {
        message.command = message.parts[2]
        if( Bot.discord.commands[message.command] ) { return Bot.discord.commands[message.command].help( message ) }    
    }

    const embed = {
        title : util.format( 
            OUTPUT["help"].title, 
            Bot.discord.client.user.username, 
            Bot.config.discord.prefix 
        ),
        description : util.format( 
            OUTPUT["help"].description, 
            "<@"+Bot.config.discord.master.join(">, <@")+">", 
        ),
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[]
    }

    
    Object.keys(Bot.config.discord.commands).forEach( group => {
        if( group !== "hidden" ) {
            if( group === "premium" && !Bot.config.discord.premium.includes(message.author.id) ) { return }         
            let fieldName = group.charAt(0).toUpperCase()+group.slice(1)
                fieldName = fieldName.replace(/_/g,' ')
                
            embed.fields.push({
                name: fieldName,
                value: Object.keys(Bot.config.discord.commands[group]).reduce((outputGroup, cmd) => {
                    return outputGroup += "**"+cmd+"** : "+Bot.config.discord.commands[group][cmd]+"\n"
                },"")+'`------------------------------`\n',
                inline:true
            })
        }
    })
    
	message.react('ℹ');
	message.channel.send({embed})

}

module.exports = {
    help:help,
    command:command
}
