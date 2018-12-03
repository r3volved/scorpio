module.exports = async ( config ) => {
    
    //Merge config with default
    SWAPI.api.config = Object.assign( SWAPI.api.config, config ) 

    SWAPI.report.dev( "SWAPI: Connecting to api" )
    
    const ApiSwgohHelp = require('api-swgoh-help')
	SWAPI.api.client = new ApiSwgohHelp( SWAPI.api.config )
	
	await SWAPI.api.client.connect()
    SWAPI.report.dev( "SWAPI: Connected to api" )
    
}
