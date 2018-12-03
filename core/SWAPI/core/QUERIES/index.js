module.exports = {
    
    queue : ( message ) => {
        process.send(JSON.stringify({
            id:message.id,
            data:{
                result:{ SWAPI:SWAPI.queue, API:SWAPI.apiq },
                error:null,
                warning:null
            }
        }))
        process.send(JSON.stringify({id:message.id}))
    },

    register : require('./register.js'),

    players : require('./players.js'),

    guilds : require('./guilds.js'),

    events : require('./events.js'),

    battles : require('./battles.js'),

    squads : require('./squads.js'),

    zetas : require('./zetas.js'),
    
    units : require('./units.js'),
    
    skills : require('./skills.js'),
    
}
