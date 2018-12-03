module.exports = async ( collection, matchCondition, saveObject ) => {
    try {
    	
        if( !collection ) { throw new Error('!! No collection specified to put'); }
        if( !saveObject ) { throw new Error('!! No object provided to put'); }
		
        const dbo = await SWAPI.mongo.db.db(SWAPI.config.mongo.db);
    	const updated = (new Date()).getTime();

    	if( typeof saveObject === 'object' && Array.isArray(saveObject) ) {

            if( saveObject.length === 0 ) {
                throw new Error('!! Empty array provided to put');
            }

    	    saveObject = saveObject.map(so => {
		        so.updated = updated;
    	        return so;
    	    });

            await dbo.collection(collection).insertMany( saveObject )

    	} else {
    	
        	if( typeof saveObject !== 'object' ) {
            	saveObject = { value: saveObject }
            }
            
            if( Object.keys(saveObject).length === 0 ) {
                throw new Error('!! Empty object provided to put');
            }
        
            saveObject.updated = updated;

            matchCondition = matchCondition || {};
        	await dbo.collection(collection).updateOne(
        	    matchCondition, 
                { $set:saveObject },
                { upsert:true, writeConcern:{ w:"majority", j:true, } }
        	)

        }

        return saveObject
        
    } catch(e) {
        SWAPI.report.error(e) 
        throw e; 
    }
}
