module.exports = async ( message ) => {
    
    const m = JSON.parse(message)
    const ref = swapi.queue.find((i) => i[0].id === m.id )

    if( ref ) {
        //Accumulate result
        if( m.data ) { ref[1]( m.data ) }
        //Reject with error
        else if ( m.error ) { ref[3]( m.error ) }
        //Resolve
        else { 
            //Remove from queue
            swapi.queue.splice( swapi.queue.indexOf(ref), 1 )
            ref[2]() 
        }
    }

}
