module.exports = async ( message ) => {

    try {
        
        const today = new Date()
        
        SWAPI.report.dev("SWAPI: Querying skills")

        //4 hour cooldown on units
        const unexpired = today.getTime() - (4*60*60000)

        SWAPI.report.dev("SWAPI: Unexpired is gt:", (new Date(unexpired)).toLocaleString())
        
        //Get updated from mongo
        const db = await SWAPI.mongo.db.db(SWAPI.config.mongo.db)
        const cursor = db.collection('skills')
            .find({updated:{ $gt:unexpired }})
            .sort({updated:-1})
            .limit(1)
        
        let found = false
        while( await cursor.hasNext() ) {
            const freshSkills = await cursor.next()
            found = true
            process.send(JSON.stringify({
                id:message.id,
                data:{
                    result:freshSkills,
                    error:null,
                    warning:null
                }
            }))
            SWAPI.report.dev("SWAPI: Served fresh")
        }


        let errors = [];
        if( !found && SWAPI.apiq >= 10 ) {

            //SERVE FROM CACHE IF POSSIBLE - **IF** API QUEUE IS FULL (10)
            const cache = db.collection('skills')
                .find({})
                .sort({updated:-1})
                .limit(1)
            
            while( await cache.hasNext() ) {
                const cacheSkills = await cursor.next()
                found = true
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:cacheSkills,
                        error:null,
                        warning:"110 fetch/skills \"Result served from cache\""
                    }
                }))
                SWAPI.report.dev("SWAPI: Served cache")
            }

        } 
        
        if( !found ) {
        
            SWAPI.report.dev("SWAPI: Fetching units")
                
            let response = null
                
            try { 
                SWAPI.apiq++
                skillResponse = await SWAPI.api.client.fetchData({
                    collection: "skillList",
                    language: message.language,
                    project: {
                        id:1, 
                        abilityReference:1,
                        isZeta:1
                    }
                })

                abilityResponse = await SWAPI.api.client.fetchData({
                    collection: "abilityList",
                    language: message.language,
                    project: {
                        id:1, 
                        type:1, 
                        nameKey:1,
                        descKey:1,
                        tierList:1
                    }
                })            
                SWAPI.apiq--
            } catch(e) {
                SWAPI.apiq--
                e.message = e.message.includes('invalid json') ? 'Sorry, I am currently disconnected from API...please try again later' : e.message
                response.error = e
            }

            if( skillResponse.result && abilityResponse.result ) {
                let index = {
			        skills:skillResponse.result,
                    abilities:abilityResponse.result,
			        updated:(new Date()).getTime()
			    }
                SWAPI.mongo.put('skills', {}, index)
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:response.result,
                        error:null,
                        warning:null
                    }
                }))
            }
            
            if( skillResponse.warning || abilityResponse.warning ) { 
                let warning = skillResponse.warning.concat( abilityResponse.warning )
                SWAPI.report.dev("SWAPI: Fetched with warning:", warning)
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:null,
                        error:null,
                        warning:warning
                    }
                }))
            }
            
            if( skillResponse.error || abilityResponse.error ) { 
                let errors = skillResponse.error.concat( abilityResponse.error ) 
                errors.forEach(e => {
                    e.message = e.type === 'invalid-json' 
                        ? 'API Error'
                        : e.message
                    e.error = e.message
                    e.description = 'Sorry, I am currently disconnected from API...please try again later'
                })   
                SWAPI.report.dev("SWAPI: Fetched with error:", errors)
                process.send(JSON.stringify({
                    id:message.id,
                    data:{
                        result:null,
                        error:errors,
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
