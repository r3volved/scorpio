module.exports = async ( config ) => {

    Bot.config.swapi = Object.assign( Bot.config.swapi, config )
    
    const { fork } = require('child_process')    
    swapi.client = fork( process.cwd()+'/core/SWAPI/core', [], {
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            CONFIG: JSON.stringify( Bot.config.swapi )
        }
    })
   
    swapi.client.on('message', swapi.message)
    
}
