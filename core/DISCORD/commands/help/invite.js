const util = require('util')
const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {

    let MESSAGE = null
    
    const embed = {
        title : util.format( OUTPUT["invite"].title, Bot.discord.client.user.username ),
        description : "`------------------------------`\n",
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[]
    }
    
    embed.description += util.format( OUTPUT["invite"].description, Bot.discord.client.user.username, Bot.discord.client.user.id )
    embed.description += "`------------------------------`\n"
    
    embed.fields.push({
        name: OUTPUT["invite"].note.name,
        value: OUTPUT["invite"].note.value,
    })

	message.react('ℹ');
	message.channel.send({embed})

}

module.exports = {
    help:help,
    command:command
}
