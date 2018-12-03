module.exports = async ( message ) => {

    try {

        const today = new Date()
        
        SWAPI.report.dev("SWAPI: Querying squads")

        //One hour cooldown on players
        const unexpired = today.getTime() - (1*60*60000)

        SWAPI.report.dev("SWAPI: Unexpired is gt:", (new Date(unexpired)).toLocaleString())
        
        //Get updated from mongo
        const db = await SWAPI.mongo.db.db(SWAPI.config.mongo.db)
        const cursor = db.collection('squads')
            .find({updated:{ $gt:unexpired }})
            .sort({updated:-1})
            .limit(1)
        
        let found = false
        while( await cursor.hasNext() ) {
            const freshSquads = await cursor.next()
            found = true
            process.send(JSON.stringify({
                id:message.id,
                data:{
                    result:freshSquads,
                    error:null,
                    warning:null
                }
            }))
            SWAPI.report.dev("SWAPI: Served fresh")
        }


        let errors = [];
        if( !found && SWAPI.apiq >= 10 ) {

            //SERVE FROM CACHE IF POSSIBLE - **IF** API QUEUE IS FULL (10)
            const cache = db.collection('squads')
                .find({})
                .sort({updated:-1})
                .limit(1)
            
            while( await cache.hasNext() ) {
                const cacheSquads = await cursor.next()
                found = true
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:cacheSquads,
                        error:null,
                        warning:"110 fetch/squads \"Result served from cache\""
                    }
                }))
                SWAPI.report.dev("SWAPI: Served cache")
            }

        } 
        
        if( !found ) {

            SWAPI.report.dev("SWAPI: Fetching squads")
                
            let response = null
                
            try { 
                SWAPI.apiq++
                response = await SWAPI.api.client.fetchSquads({
                    language:message.language
                })
                SWAPI.apiq--
            } catch(e) {
                SWAPI.apiq--
                e.message = e.message.includes('invalid json') ? 'Sorry, I am currently disconnected from API...please try again later' : e.message
                response.error = e
            }

            if( response.result ) {
                SWAPI.mongo.put('squads', {}, response.result)
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:response.result,
                        error:null,
                        warning:null
                    }
                }))
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
