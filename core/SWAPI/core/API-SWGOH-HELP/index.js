module.exports = {

    client : null,
    config : {
        user : null,
        pass : null,
        language : 'eng_us'
    },
    
    open  : require('./open.js'),
    close : require('./close.js'),

    request : require('./request.js')
    
}
