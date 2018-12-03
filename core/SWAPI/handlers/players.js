module.exports = async ( allycodes, conversion ) => {
    
    return await swapi.response({
        method:'players',
        allycodes:allycodes,
        language:Bot.config.swapi.api.language
    }, conversion )
    
}
