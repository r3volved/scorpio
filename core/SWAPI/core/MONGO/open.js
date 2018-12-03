const dbEvent = (event) => {
    SWAPI.report.error('SWAPI: MONGO received event',event);
}

module.exports = async ( config ) => {

    SWAPI.mongo.config = Object.assign( SWAPI.mongo.config, config )

    let connectionString = "mongodb://";
        connectionString += SWAPI.mongo.config.user;
        connectionString += SWAPI.mongo.config.pass ? ":"+SWAPI.mongo.config.pass : "";
        connectionString += SWAPI.mongo.config.user && SWAPI.mongo.config.pass ? "@" : ""
        connectionString += SWAPI.mongo.config.host;
        connectionString += SWAPI.mongo.config.port ? ":"+SWAPI.mongo.config.port : "";
        connectionString += SWAPI.mongo.config.auth;
    
    SWAPI.report.dev('SWAPI: Connecting to mongo:', connectionString)
                
    try {
    
        const MongoClient = require('mongodb').MongoClient;
        SWAPI.mongo.db = await MongoClient.connect(connectionString, {
            autoReconnect:true,

            poolSize: 1,
            socketTimeoutMS: 480000,
            keepAlive: 300000,

            keepAliveInitialDelay : 300000,
            connectTimeoutMS: 30000,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 2000,
            useNewUrlParser: true,
            autoReconnect:true
        })
        
        // =====MONITOR SWGOHDB=====
        SWAPI.mongo.db.topology.on('serverDescriptionChanged',   dbEvent);
        SWAPI.mongo.db.topology.on('serverHeartbeatStarted',     dbEvent);
        SWAPI.mongo.db.topology.on('serverHeartbeatSucceeded',   dbEvent);
        SWAPI.mongo.db.topology.on('serverHeartbeatFailed',      dbEvent);
        SWAPI.mongo.db.topology.on('serverOpening',              dbEvent);
        SWAPI.mongo.db.topology.on('serverClosed',               dbEvent);
        SWAPI.mongo.db.topology.on('topologyOpening',            dbEvent);
        SWAPI.mongo.db.topology.on('topologyClosed',             dbEvent);
        SWAPI.mongo.db.topology.on('topologyDescriptionChanged', dbEvent);

    	SWAPI.report.dev('SWAPI: Connected to mongo')
        
        return true
        
    } catch(e) { throw e }     

}
