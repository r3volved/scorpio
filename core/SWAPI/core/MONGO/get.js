module.exports = async ( collection, aggregate, database ) => {
    try {
        const dbo = await SWAPI.mongo.db.db(database || SWAPI.config.mongo.db)
        return await dbo.collection(collection).aggregate(aggregate).toArray()
    } catch(e) { throw e }
}
