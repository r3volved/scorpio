module.exports = async ( registration, conversion ) => {

    Report.dev("SWAPI: registration", registration )
    
    if( registration.put ) {
        registration.get = registration.get 
            ? registration.get.concat( registration.put.map(p => p[0]) )
            : registration.put.map(p => p[0])
    }        
    
    return await swapi.response({
        method:'register',
        get: registration.get,
        put: registration.put,
        del: registration.del
    }, conversion )
    
}
