module.exports = async () => {
    
    return SWAPI.mongo.db ? await SWAPI.mongo.db.close() : true

}
