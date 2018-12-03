module.exports = async ( request, conversion ) => {
    
    conversion = conversion ? conversion : (i) => { return i }
    
    const results  = []
    const warnings = [];
    const errors   = [];
        
    return new Promise( ( resolve, reject ) => {
        
        const end = ( e ) => {
            if( e ) errors.push(e)
            resolve({ 
                result:results.filter(i => i), 
                error:errors.filter(i => i), 
                warning:warnings.filter(i => i) 
            })
        }
    
        swapi.request( request, ( response ) => {
            let { result, error, warning } = response
            if( result )  { results.push( conversion( result ) ) }
            if( errors )  { errors.push( error ) }
            if( warning ) { warnings.push( warning ) }
        }).then(end).catch(end)
        
    })
    
}
