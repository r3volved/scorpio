module.exports = async ( conversion ) => {
    
    return await swapi.response({
        method:'events',
        language:Bot.config.swapi.api.language
    }, conversion )
        
}
