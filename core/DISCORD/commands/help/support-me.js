const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {

    let MESSAGE = null
    
    const embed = {
        title : OUTPUT["support-me"].title,
        description : OUTPUT["support-me"].description,
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
