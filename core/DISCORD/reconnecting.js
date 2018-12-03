module.exports = async ( event ) => {
    event = event || {}
    Report.error(`BOT: ! Client reconnecting : [${event.code}] : ${event.reason || event.message}`)
}
