module.exports = async ( message ) => {

    try {
        
        const today = new Date()
        
        SWAPI.report.dev("SWAPI: Querying zetas")

        //One hour cooldown on players
        const unexpired = today.getTime() - (1*60*60000)

        SWAPI.report.dev("SWAPI: Unexpired is gt:", (new Date(unexpired)).toLocaleString())
        
        //Get updated from mongo
        const db = await SWAPI.mongo.db.db(SWAPI.config.mongo.db)
        const cursor = db.collection('zetas')
            .find({updated:{ $gt:unexpired }})
            .sort({updated:-1})
            .limit(1)
        
        let found = false
        while( await cursor.hasNext() ) {
            const freshZetas = await cursor.next()
            found = true
            process.send(JSON.stringify({
                id:message.id,
                data:{
                    result:freshZetas,
                    error:null,
                    warning:null
                }
            }))
            SWAPI.report.dev("SWAPI: Served fresh")
        }


        let errors = [];
        if( !found && SWAPI.apiq >= 10 ) {

            //SERVE FROM CACHE IF POSSIBLE - **IF** API QUEUE IS FULL (10)
            const cache = db.collection('zetas')
                .find({})
                .sort({updated:-1})
                .limit(1)
            
            while( await cache.hasNext() ) {
                const cacheZetas = await cursor.next()
                found = true
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:cacheZetas,
                        error:null,
                        warning:"110 fetch/zetas \"Result served from cache\""
                    }
                }))
                SWAPI.report.dev("SWAPI: Served cache")
            }

        } 
        
        if( !found ) {
        
            SWAPI.report.dev("SWAPI: Fetching zetas")
                
            let response = null
                
            try { 
                SWAPI.apiq++
                response = await SWAPI.api.client.fetchZetas({
                    language:message.language
                })
                SWAPI.apiq--
            } catch(e) {
                SWAPI.apiq--
                e.message = e.message.includes('invalid json') ? 'Sorry, I am currently disconnected from API...please try again later' : e.message
                response.error = e
            }

            if( response.result ) {
                let skills = (await SWAPI.mongo.get('skills',[{$match:{}},{$sort:{updated:-1}},{$limit:1}],'swapi'))[0]
                response.result.zetas.forEach(z => {
                    let ab = skills.abilities.find(a => a.nameKey === z.name)
                    let sk = ab ? skills.skills.find(s => s.abilityReference === ab.id) : null
                    z.id = sk ? sk.id : null
                })
                            
                SWAPI.mongo.put('zetas', {}, response.result)
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
        console.error(e)
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
