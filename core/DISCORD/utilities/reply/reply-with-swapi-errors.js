module.exports = async ( message, response, MESSAGE ) => {

    //Otherwise echo errors and warnings
    const embed = {
        title : `Could not find any results`,
        description : '`------------------------------`\n',
        color: 0xBB2A6E,
        timestamp: new Date(),
        fields:[]
    }

    if( response.warning.length ) {
        embed.fields.push({
            name:"Warnings",
            value:response.warning.reduce((acc,a) => {
                return acc.concat( a )
            },[]).join("\n")
        })
        //await Bot.discord.util.react(message, "😖") 
        await Bot.discord.util.react(message, "⚠") 
    }
    
    if( response.error.length ) {
        embed.fields.push({
            name:"Errors",
            value:response.error.map(e => { return "**"+e.error+"** : "+e.description+"\n"}).join("\n")
        })
        //await Bot.discord.util.react(message, "😖") 
        await Bot.discord.util.react(message, "❌") 
    }

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
