module.exports = async ( message, reaction ) => {
    try {
        return await message.react( reaction )
    } catch(e) {
        console.error("ERROR Reaction", e.message)
        return
    }
}
