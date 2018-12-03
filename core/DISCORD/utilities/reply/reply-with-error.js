module.exports = async ( message, error, MESSAGE ) => {

    //Otherwise echo errors and warnings
    const embed = {
        title : error.message,
        description : error.description,
        color: 0xBB2A6E,
        timestamp: new Date(),
        fields:[]
    }

    await Bot.discord.util.react(message, "😖") 
    //await Bot.discord.util.react(message, "❌") 
    
    if( MESSAGE ) {
        try {
            return await MESSAGE.edit({embed})
        } catch(e) {
            console.error("ERROR: Message edit", e.message)
            return await message.author.send({embed})
        }
    } else {
        try {
            return await message.channel.send({embed})
        } catch(e) {
            console.error("ERROR: Message send", e.message)
            return await message.author.send({embed})
        }
    }
}
