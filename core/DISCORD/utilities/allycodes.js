module.exports = async ( message ) => {

    await Bot.discord.util.react(message, "🤔")

    //Parse allycodes
    let allycodes = message.parts.slice(2).filter(p => p.match(/^\d{3}-*\d{3}-*\d{3}$/))
        allycodes = allycodes.map(a => Number(a.replace(/-/g,'')))
    if( allycodes.length ) { return allycodes }
    
    //Parse mentions
    let discord = message.parts.slice(2).filter(i => i.match(/\d{17,18}/) || i === 'me')
    discord = discord.map( d => {
        if( d === 'me' ) return message.author.id
        else return d.replace(/[\<\@\!\>]/g,'')
    }).filter(d => d)
        
    //If none, assume author
    if( !discord.length ) discord.push( message.author.id )

    //await Bot.discord.util.react(message, "🙄")

    //Get registration from swapi
    const registration = await Bot.swapi.register({
        get:discord
    })

    //Concate results to allycodes
    if( registration.result[0].get ) {
        allycodes = allycodes.concat( registration.result[0].get.map(i => Number(i.allyCode)) )
    }
    
    if( !allycodes.length ) {
        let error = new Error("Not found")
            error.description = "No allycodes specified, or found registered to <@"+discord.join(">, <@")+">"
        throw error
    } 
    
    return allycodes

}
