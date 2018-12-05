const fetch = require('node-fetch')
module.exports = ( method, criteria, source ) => {
    source = source || ( Bot.premium && Bot.premium.source ? Bot.premium.source : "http://localhost/" )
    criteria = !Array.isArray(criteria) ? [ criteria ] : criteria
    return new Promise(async (resolve,reject) => {
        let results = [];
        //Fetch in series - slower but stable
        for( let i of criteria ) {
            let url = source+method+"/"+i
            results.push( await fetch(url).then(res => res.json()) )
        }
        resolve(results)
    })
}
