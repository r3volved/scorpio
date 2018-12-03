module.exports = async ( conversion ) => {
    
    return await swapi.response({
        method:'skills',
        language:Bot.config.swapi.api.language
    }, conversion )
        
}
