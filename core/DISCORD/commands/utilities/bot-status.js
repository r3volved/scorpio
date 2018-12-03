const util = require('util')

const help = async ( message ) => {
    return command( message )
}


const command = async ( message ) => {

    let MESSAGE = null
    
    const embed = {
        title : util.format( OUTPUT["bot-status"].command.title, Bot.discord.client.user.username ),
        description : util.format( OUTPUT["bot-status"].command.description, Bot.app.name, Bot.app.version, Bot.app.author, Bot.app.description ),
        color: 0x5884B5,
        timestamp: new Date(),
        fields:[]
    }
    
    let count = 0;
    let serverDump = Bot.discord.client.guilds.map(g => { return [
        ++count, g.id, g.name, g.region, g.memberCount
    ]})

    if( message.parts.includes("dump") ) {
        const fs = require('fs');
        fs.writeFileSync('server-dump-'+Bot.discord.client.user.username+'.json', JSON.stringify({
            bot: Bot.discord.client.user.username,
            date: (new Date()).toLocaleString(),
            servers: serverDump
        }), 'utf8')
    }
    

    //COMMANDS    
    let field = {
        name:util.format( OUTPUT["bot-status"].command.fields[0].name, Object.keys(Bot.discord.commands).filter(c => Bot.discord.commands[c]).length ),
        value:Object.keys(Bot.discord.commands).filter(c => Bot.discord.commands[c]).join(", ")+"\n",
        inline:false
    }
	field.value += "`------------------------------`\n";
	embed.fields.push( field )

    
    let regions = []
    serverDump.map(d => d[3]).forEach(r => {
        if( !regions.includes(r) ) { regions.push(r) }
    })
    
    regions.sort((a,b) => serverDump.filter(s => s[3] === b).length - serverDump.filter(s => s[3] === a).length)

    //PRESENCE
    field = {
        name:OUTPUT["bot-status"].command.fields[1].name,
        value:util.format( 
            OUTPUT["bot-status"].command.fields[1].value, 
            serverDump.reduce((sum,c) => { return sum + c[4]},0).toLocaleString(), 
            serverDump.length,
            regions.length
        ),
        inline:true
    }
    
	field.value += regions.reduce((acc,r) => {
	    return acc + "`"+serverDump.filter(s => s[3] === r).length+"x` *"+r+"*\n"
	},"")
	field.value += '`------------------------------`\n';
	embed.fields.push( field )


    let swapi = await Bot.swapi.util.queue()

    //FOOTPRINT
    field = {
        name: OUTPUT["bot-status"].command.fields[2].name,
        value: util.format( 
            OUTPUT["bot-status"].command.fields[2].value, 
            (Bot.swapi.client ? "running" : "disconnected"),
            swapi.queue.length,
            swapi.SWAPI,
            swapi.API,
            (process.memoryUsage().rss * 1e-6).toFixed(2),
            (process.memoryUsage().heapTotal * 1e-6).toFixed(2),
            (process.memoryUsage().heapUsed * 1e-6).toFixed(2),
            (process.memoryUsage().external * 1e-6).toFixed(2)
        ),
        inline:true
    }
	embed.fields.push( field )
    
	message.react('ℹ');
	message.channel.send({embed})

}

module.exports = {
    help:help,
    command:command
}
