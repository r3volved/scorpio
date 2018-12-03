module.exports = async ( conversion ) => {
    
    return await swapi.response({
        method:'squads',
        language:Bot.config.swapi.api.language
    }, conversion )
        
}
