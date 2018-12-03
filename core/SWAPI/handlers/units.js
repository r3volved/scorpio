module.exports = async ( conversion ) => {
    
    return await swapi.response({
        method:'units',
        language:Bot.config.swapi.api.language
    }, conversion )
        
}
