const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {

    let MESSAGE = null
    
    const embed = {
        title : OUTPUT["raw"].title,
        description : OUTPUT["raw"].description,
        color: 0x2A6EBB,
        timestamp: new Date(),
        fields:[]
    }
    
	message.react('ℹ');
	message.channel.send({embed})

}

module.exports = {
    help:help,
    command:command
}
