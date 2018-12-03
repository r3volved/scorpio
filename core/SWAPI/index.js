global.swapiRequests = 0;

swapi = {

    client : null,
    queue  : [],
    
    //Load event handlers
    open     : require('./open.js'),
    close    : require('./close.js'),
    request  : require('./request.js'),
    message  : require('./message.js'),
    response : require('./response.js'),


    //Load interface handlers
    register: require('./handlers/register.js'),
    players : require('./handlers/players.js'),
    guilds  : require('./handlers/guilds.js'),
    events  : require('./handlers/events.js'),
    battles : require('./handlers/battles.js'),
    squads  : require('./handlers/squads.js'),
    zetas   : require('./handlers/zetas.js'),


    //Load interface utilities
    util: require('./util'),

}

module.exports = swapi
