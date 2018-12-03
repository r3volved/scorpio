module.exports = async ( config ) => {

    SWAPI.config = config ? Object.assign( SWAPI.config, JSON.parse(config) ) : SWAPI.config
    SWAPI.report.dev('SWAPI: Configured')

    
    //Init mongo
    SWAPI.report.dev('SWAPI: Initializing mongo')
    await SWAPI.mongo.open( SWAPI.config.mongo );    
    

    //Init API
    SWAPI.report.dev('SWAPI: Initializing api')
    await SWAPI.api.open( SWAPI.config.api );    
    
}
