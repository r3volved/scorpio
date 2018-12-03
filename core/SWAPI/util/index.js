module.exports = {

    queue : async () => {
        const {result,error,warning} = await swapi.response({method:'queue'})
        return {
            queue : Bot.swapi.queue,
            SWAPI : result[0].SWAPI,
            API   : result[0].API
        }
    },

    roster : require('./roster'),

    player : require('./player'),

    guild : require('./guild'),
    
    mod : require('./mods'),
    
    enums : require('./enums.js'),

}
