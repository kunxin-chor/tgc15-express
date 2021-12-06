const express = require('express');
const hbs = require('hbs');
const helpers = require('handlebars-helpers');
helpers({
    'handlebars': hbs.handlebars
})
const ObjectId = require('mongodb').ObjectId;
const waxOn = require('wax-on');

// put all variables defined in .env files
// into process.env
require('dotenv').config();

// import in the MongoUtil object
const MongoUtil = require('./MongoUtil')

// process is an object available to Nodejs program
// it represents the current running program
// .env refers to the ENVIRONMENT
// MONGO_URI is the name of our environmental variable
const MONGO_URI = process.env.MONGO_URI;
const app = express();
app.set('view engine', 'hbs');
waxOn.on(hbs.handlebars);
waxOn.setLayoutPath('./views/layouts');

// inform Express that we are using forms
app.use(express.urlencoded({
    'extended': false
}))

async function main() {
    await MongoUtil.connect(MONGO_URI, "tgc15_cico");
   
    app.get('/', async function(req,res){
      const db = MongoUtil.getDB();

      // fetch all the documents from the food_records collection
      let foodRecords = await db.collection('food_records').find({}).toArray();

      res.render('all_food_records',{
          'foodRecords': foodRecords
      })


    })

    app.get('/food_record/add', function(req,res){
        res.render('add_food_record')
    })

    app.post('/food_record/add',  async function(req,res){
        // let foodName = req.body.foodName;
        // let calories = req.body.calories;
        // let tags = req.body.tags;
        // the syntax below is known as destructuring 
        // (more specifically object destructuring)
        let {foodName, calories, tags} = req.body;
        tags = tags || [];
        // if tags is undefined, then the expr:
        // --> tags = undefined || []
        // --> tags= []
        if (!Array.isArray(tags)) {
            tags = [tags];
        }

        // create the document
        let documentToInsert = {
            'foodName': foodName,
            'calories': parseFloat(calories),
            'tags': tags
        }

        const db = MongoUtil.getDB();
        
        // db.collection() takes one argument and it's the collection that
        // you want to target
        await db.collection('food_records').insertOne(documentToInsert);
        res.redirect('/')    

       
    })

    app.get('/food_record/:id/update', async function(req,res){
        // grab the existing details of the food record that we want to edit
        let id = req.params.id;
        const db = MongoUtil.getDB();
        // use .findOne to find only one document
        let foodRecordToBeEdited = await db.collection('food_records').findOne({
            '_id': ObjectId(id)
        })
    
        // display the extisting details in the form
        res.render('update_food_record',{
            'foodRecord': foodRecordToBeEdited
        })
    })

    app.post('/food_record/:id/update', async function(req,res){
        let id = req.params.id;
        const db = MongoUtil.getDB();
        let tags = req.body.tags;
        tags = tags || [];
        if (!Array.isArray(tags)) {
            tags = [ tags ];
        }
        let updatedDocument = {
            'foodName': req.body.foodName,
            'calories': req.body.calories,
            'tags': tags
        }

        await db.collection('food_records').updateOne({
            '_id': ObjectId(id)
        }, {
            // we have to use the atomic operator "$set"
            // to provide the updated document
            '$set': updatedDocument
        });
        res.redirect('/');
    })
}
main();


// begin the server
app.listen(3000, function(){
    console.log("server has started");
})


