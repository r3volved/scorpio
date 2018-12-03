const env = process.env.NODE_ENV || 'development'
const config = process.env.CONFIG || null

global.SWAPI = {

    config : {},
    queue  : 0,
    apiq   : 0,
    
    //Load event handlers
    open    : require('./open.js'),
    close   : require('./close.js'),
    message : require('./message.js'),
    handle  : require('./QUERIES'),

    //Route reporting
    report:{
        log   : console.log,
        info  : env === 'production' ? console.log : () => {},
        dev   : env !== 'production' ? console.log : () => {},
        error : env !== 'production' ? console.error : () => {},
    },
            
    //Load modules        
    mongo : require('./MONGO'),
    api   : require('./API-SWGOH-HELP')
    
}

process.on('SIGTERM', SWAPI.close)
process.on('SIGINT',  SWAPI.close)
process.on('message', SWAPI.message)

SWAPI.open( config )
