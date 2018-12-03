module.exports = async ( message ) => {

    try {

		const response = await SWAPI.api.client.fetchAPI('/registration', {
			"put":message.put,
			"get":message.get,
			"del":message.del
		});

        SWAPI.report.dev("SWAPI: results ", JSON.stringify(response,null,2))

        process.send(JSON.stringify({
            id:message.id,
            data:response
        }))

        SWAPI.report.dev("SWAPI: Registration complete")
        process.send(JSON.stringify({id:message.id}))

    } catch(e) {
        e.message = e.type === 'invalid-json' 
            ? 'API Error'
            : e.message
        e.error = e.message
        e.description = 'Sorry, I am currently disconnected from API...please try again later'
            
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
