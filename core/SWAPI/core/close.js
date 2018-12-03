module.exports = async ( code ) => {

    SWAPI.report.log( `SWAPI: Recieved kill code ${code}` )
    let errors = false;

    //Attempt api termination    
    try { 
        await SWAPI.api.close()
        SWAPI.report.log( `SWAPI: Connection to api has been terminated` )
    } catch(e) {
        SWAPI.report.log( `SWAPI: Error disconnecting from api` )
        SWAPI.report.error( e )
    }

    //Attempt mongo termination    
    try { 
        await SWAPI.mongo.close()
        SWAPI.report.log( `SWAPI: Connection to mongo has been terminated` )
    } catch(e) {
        SWAPI.report.log( `SWAPI: Error disconnecting from mongo` )
        SWAPI.report.error( e )
    }

    //Attempt process termination
    if( errors ) {
        SWAPI.report.log( `SWAPI has terminated with errors ...` )
        process.exit(1)
    } else {
        SWAPI.report.log( `SWAPI has been terminated ... thanks for all the fish` )
        process.exit(0)
    }

}
