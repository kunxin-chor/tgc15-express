// import in the packages
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// require in the library for cross origin resources sharing
const cors = require('cors');

// import in the MongoUtil object from MongoUtil.js
const MongoUtil = require('./MongoUtil');
const { ObjectId } = require('bson');

let app = express();
app.use(express.json()); // allows clients (such as browsers) to send JSON requests to our Express server

// enable cors so that javascript ran from other domain can access the endpoint
app.use(cors());

async function main() {

    // we want to connect to the database
    await MongoUtil.connect(process.env.MONGO_URI, "tgc15_food_sightings");

    // ROUTES
    app.get('/', function(req,res){
        res.json({
            "message":"Hello from my API endpoint"
        })
    })

    // Route to add in a new food sighting
    app.post('/food_sighting', async function(req,res){
        const db = MongoUtil.getDB();
        
        // define the sample document:
        /*
        {
            description: "a description about the food sighting",
            foods: ["roti prata", "fishball", "fried rice"],
            date: "2021-12-31"
        }
        */

        let description = req.body.description;
        let foods = req.body.foods;
        let date = new Date(req.body.date) || new Date();

        // if any lines in the try block causes an error, immediately go to the catch part
        try {
            let result = await db.collection('sightings').insertOne({
                'description': description,
                'foods': foods,
                'date': date
            })
            res.json(result);
        }
        catch (e) {
            // if there is an error while trying to add to the database,
            // we will inform the client
            res.status(500); // tell the client we had an internal server error
            res.json({
                'error': "Failed to add record"
            })
        }
      
    })

    // allows users to search for food sightings
    app.get('/food_sightings', async function(req,res){
        const db = MongoUtil.getDB();
        // db.collection('sightings').find({
        //     'description': {$regex: "LT2A", $options:'i'},
        //     'food': {
        //         '$in': ["fried rice"]
        //     }
        // })

        console.log(req.query);

        // define an empty search critera
        // if the user didn't specify any search critera, the search will return all documents
        let critera = {};

        // if the client provides a value for description in the axios.get
        // note: for the get method, if the client sends data via params in the API call, it's available via req.query
        if (req.query.description) {
            critera["description"] = {
                '$regex': req.query.description,
                '$options': 'i'
            }
        }

        // if the client provides a value for the food key in the axios.get
        if (req.query.food) {
            critera["foods"] = {
                "$in":[ req.query.food]
            }
        }

        try {
            let results = await db.collection('sightings').find(critera).toArray();
            res.json(results);
        }
        catch(e) {
            res.status(500);
            res.json({
                'error':"Unable to fetch records"
            })
        }        
    })

    // we are using PUT instead of POST because we are updating an existing document by providing a replacement document
    app.put('/food_sighting/:id', async function(req,res){
        try {
            await db.collection('sightings').updateOne({
                '_id':ObjectId(req.params.id)
            }, {
                'description': req.body.description, // for post, put and patch, the data sent to the endpoint is in req.body
                'foods': req.body.foods,
                'date': new Date(req.body.date) || new Date()
            })
            res.json({
                'message':"success"
            })
        } catch(e) {
            res.status(500);
            res.json({
                'message':"Unable to update document"
            })
        }
    })

    // for endpoints that delete documents, we use app.delete
    app.delete('/food_sighting/:id', async function(req,res){
        const db = MongoUtil.getDB();
        await db.collection('sightings').remove({
            '_id':ObjectId(req.params.id)
        })
        res.json({
            'message':"Record has been deleted"
        })
    })
}
// run the main function immediately after we define it
main();


// START SERVER
app.listen(3000, function(req,res){
    console.log("Server started")
})