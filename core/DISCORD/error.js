module.exports = async ( error ) => {
    error = error || {}
    Report.error( `BOT: ! Client error : [${error.code}] : ${error.reason || error.message}` )
    Report.error( error )
}
