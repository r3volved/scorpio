module.exports = async ( message ) => {

    try {
    
        const today = new Date()
        const acIn = Object.assign([], message.allycodes)
        
        SWAPI.report.dev("SWAPI: Querying guilds:", acIn)

        //Three hour cooldown on players
        const unexpired = today.getTime() - (3*60*60000)

        SWAPI.report.dev("SWAPI: Unexpired is gt:", (new Date(unexpired)).toLocaleString())
        
        //Get updated from mongo
        const db = await SWAPI.mongo.db.db(SWAPI.config.mongo.db)
        const cursor = db.collection('guilds')
            .find({roster:{ $elemMatch:{ allyCode:{ $in:acIn } } }, updated:{ $gt:unexpired }})
            .sort({updated:-1})
        
        let acNotFound = Object.assign([], message.allycodes)
        while( await cursor.hasNext() ) {
            const freshGuild = await cursor.next()
            acNotFound = acNotFound.filter(a => !freshGuild.roster.map(p => p.allyCode).includes(a))
            process.send(JSON.stringify({
                id:message.id,
                data:{
                    result:freshGuild,
                    error:null,
                    warning:null
                }
            }))
            SWAPI.report.dev("SWAPI: Served fresh")
        }

        let errors = [];
        if( acNotFound.length && SWAPI.apiq >= 10 ) {

            //SERVE FROM CACHE IF POSSIBLE - **IF** API QUEUE IS FULL (10)
            const cache = db.collection('guilds')
                .find({roster:{ $elemMatch:{ allyCode:{ $in:acNotFound } } }})
                .sort({updated:-1})
            
            while( await cache.hasNext() ) {
                const cacheGuild = await cursor.next()
                let ac = "guild"
                acNotFound = acNotFound.filter(a => {
                    ac = cacheGuild.roster.map(p => p.allyCode).includes(a) ? a : ac
                    return !cacheGuild.roster.map(p => p.allyCode).includes(a)
                })
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:cacheGuild,
                        error:null,
                        warning:"110 fetch/"+ac+" \"Result served from cache\""
                    }
                }))
                SWAPI.report.dev("SWAPI: Served cache")
            }

        } 
        
        
        if( acNotFound.length ) {

            SWAPI.report.dev("SWAPI: Fetching guilds:", acNotFound)
            
            let response = null
                
            try { 
                SWAPI.apiq++
                response = await SWAPI.api.client.fetchGuild({
                    allycodes:acNotFound,
                    language:message.language
                })
                SWAPI.apiq--
            } catch(e) {
                SWAPI.apiq--
                e.message = e.message.includes('invalid json') ? 'Sorry, I am currently disconnected from API...please try again later' : e.message
                response.error = e
            }

            if( response.result ) {
                response.result.forEach( g => {
                    SWAPI.mongo.put('guilds', {id:g.id}, g)
                    process.send(JSON.stringify({
                        id:message.id,
                        data:{
                            result:g,
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
