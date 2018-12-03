module.exports = ( request, accumulator ) => {
    return new Promise((resolve, reject) => {
        request.id = swapiRequests++;        
        swapi.queue.push([request, accumulator, resolve, reject])
        swapi.client.send(JSON.stringify(request))
    })
}
