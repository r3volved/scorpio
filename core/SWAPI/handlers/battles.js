module.exports = async ( conversion ) => {
    
    return await swapi.response( {
        method:'battles',
        language:Bot.config.swapi.api.language
    }, conversion )
        
}
