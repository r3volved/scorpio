module.exports = async ( event ) => {
    event = event || {}
    Report.error(`BOT: ! Client has resumed : [${event.code}] : ${event.reason || event.message}`)
}
