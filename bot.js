const env = process.env.NODE_ENV || 'development'
const config = require("./config/config.js")


//Global bot reference
global.Bot = {
    root    : process.cwd(),
    env     : env,
    app     : require("./package.json"),
    config  : config[env],
    
    //Load event handlers
    open  : require('./config/open.js'),
    close : require('./config/close.js')
}

global.OUTPUT = require('./localization')

//Global logging
global.Report = {
    log   : console.log,
    info  : env === 'production' ? console.log : () => {},
    dev   : env !== 'production' ? console.log : () => {},
    error : env !== 'production' ? console.error : () => {},
}


if( !config ) {
    Report.error( `Unable to load config "${env}"` )
    process.exit(0)
}


process.on('SIGTERM', Bot.close)
process.on('SIGINT',  Bot.close)


//Do bot start up
Bot.open();

