module.exports = async ( message ) => {
    
    SWAPI.report.dev('SWAPI: routing request', message)
    const m = JSON.parse(message);
    SWAPI.queue++
    await SWAPI.handle[m.method]( m ) 
    SWAPI.queue--
    
}


