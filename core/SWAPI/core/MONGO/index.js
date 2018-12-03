module.exports = {

    db : null,
    config : {
        user : null,
        pass : null,
        host : null,
        port : null,
        auth : null
    },
    
    open  : require('./open.js'),
    close : require('./close.js'),

    get : require('./get.js'),
    put : require('./put.js')
    
}
