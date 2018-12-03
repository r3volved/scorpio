module.exports = async ( message, options, MESSAGE ) => {
    const embed = Object.assign({
        title: "Loading",
        description: "please wait...\n",
        color: 0xAAAAAA,
        footer: { text: "Searching..." },
        image: { url:"https://media.discordapp.net/attachments/416390341533368321/502658773920514049/bb8s.gif" },
        timestamp: new Date()
    }, options || {})
    
    try {
        return MESSAGE ? MESSAGE.edit({embed}) : await message.channel.send({embed})
    } catch(e) {
        console.error("ERROR: Loading",e.message)
        return await message.author.send({embed})
    }
}
