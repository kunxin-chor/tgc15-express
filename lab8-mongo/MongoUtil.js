const MongoClient = require('mongodb').MongoClient;

let _db;

async function connect(uri, dbname) {
    // connecting to a database is async 
    // the connect function takes in two arugments
    // 1. the URI to the your database
    // 2. option object
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    })    
    // assign the global variable _db to the database
    // that we want to use
    _db = client.db(dbname);
    console.log("Database has been connected");
}

function getDB() {
    return _db;
}

// module.exports is defined by NodeJS
// (read up CommonJS)
module.exports  = {
    connect,  // other javascript files can use this connect function
    getDB
}