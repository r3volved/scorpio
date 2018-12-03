module.exports = async ( message ) => {

    try {
SWAPI.report.dev(SWAPI.config.mongo.db)

        const today = new Date()
        const acIn = Object.assign([], message.allycodes)
        
        SWAPI.report.dev("SWAPI: Querying players:", acIn.length)

        //One hour cooldown on players
        const unexpired = today.getTime() - (1*60*60000)

        SWAPI.report.dev("SWAPI: Unexpired is gt:", (new Date(unexpired)).toLocaleString())
        
        //Get updated from mongo
        const db = await SWAPI.mongo.db.db(SWAPI.config.mongo.db)
        const cursor = db.collection('players')
            .find({allyCode:{ $in:acIn }, updated:{ $gt:unexpired }})
            .sort({allyCode:1, updated:-1})
        
        const acFound = []
        while( await cursor.hasNext() ) {
            const freshPlayer = await cursor.next()
            acFound.push( freshPlayer.allyCode )
            process.send(JSON.stringify({
                id:message.id,
                data:{
                    result:freshPlayer,
                    error:null,
                    warning:null
                }
            }))
            SWAPI.report.dev("SWAPI: Served fresh")
        }

        SWAPI.report.dev("SWAPI: Found players:", acFound.length)

        const acNotFound = acIn.filter(a => !acFound.includes(a))
        let errors = [];
        if( acNotFound.length && SWAPI.apiq >= 10 ) {

            //SERVE FROM CACHE IF POSSIBLE - **IF** API QUEUE IS FULL (10)
            const cache = db.collection('players')
                .find({allyCode:{ $in:acNotFound }})
                .sort({allyCode:1, updated:-1})
            
            while( await cache.hasNext() ) {
                const cachePlayer = await cursor.next()
                acNotFound.splice( acNotFound.indexOf(cachePlayer.allyCode),1 )
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:cachePlayer,
                        error:null,
                        warning:"110 fetch/"+cachePlayer.allyCode+" \"Result served from cache\""
                    }
                }))
                SWAPI.report.dev("SWAPI: Served cache")
            }

        } 
        
 
        if( acNotFound.length ) {

            SWAPI.report.dev("SWAPI: Fetching players:", acNotFound.length)
              
            let response = {}
                
            try { 
                SWAPI.apiq++
                response = await SWAPI.api.client.fetchPlayer({
                    allycodes:acNotFound,
                    language:message.language
                })
                SWAPI.apiq--
            } catch(e) {
                SWAPI.apiq--
                response.error = e
            }

            if( response.result ) {
                response.result.forEach( p => {
                    SWAPI.mongo.put('players', {allyCode:p.allyCode}, p)
                    process.send(JSON.stringify({
                        id:message.id,
                        data:{
                            result:p,
                            error:null,
                            warning:null
                        }
                    }))
                })
            }
            
            if( response.warning ) { 
                SWAPI.report.dev("SWAPI: Fetched with warning:", response.warning)
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:null,
                        error:null,
                        warning:response.warning
                    }
                }))
            }
            
            if( response.error ) { 
                response.error.message = response.error.type === 'invalid-json' 
                    ? 'API Error'
                    : response.error.message
                response.error.error = response.error.message
                response.error.description = 'Sorry, I am currently disconnected from API...please try again later'
                    
                SWAPI.report.dev("SWAPI: Fetched with error:", response.error)
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:null,
                        error:response.error,
                        warning:null
                    }
                }))
            }

            SWAPI.report.dev("SWAPI: Fetched complete")
        }

        process.send(JSON.stringify({id:message.id}))

    } catch(e) {
SWAPI.report.error(e)

        process.send(JSON.stringify({
            id:message.id,
            data:{
                result:null,
                error:e,
                warning:null
            }
        }))
        process.send(JSON.stringify({id:message.id}))
    }
}
