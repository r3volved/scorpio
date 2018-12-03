module.exports = async ( conversion ) => {
    
    return await swapi.response({
        method:'zetas',
        language:Bot.config.swapi.api.language
    }, conversion )
        
}
