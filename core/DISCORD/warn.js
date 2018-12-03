module.exports = async ( event ) => {
    event = event || {}
    Report.error(`BOT: ! Client warning : [${event.code}] : ${event.reason || event.message}`)
}
