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
const MongoUtil = require('./MongoUtil');
const { ReadPreferenceMode } = require('mongodb');

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

async function getNoteByID(noteid) {
    const db = MongoUtil.getDB();
    let results = await db.collection('food_records').findOne({
        'notes._id': ObjectId(noteid)
    }, 
    // second argument to the findOne function allows us to provide an object with options
    {
        'projection': { 
            // projection is to select which keys of the document to show
            'notes': {
                '$elemMatch':{
                    '_id': ObjectId(noteid) // only show the element from the notes array where its _id matches
                                                       // the provided noteid
                }
            }
        }
    });
    return results.notes[0];
}

async function getFoodRecordByNote(noteid){
    const db = MongoUtil.getDB();
    let foodRecord = await db.collection('food_records').findOne({
        'notes._id': ObjectId(noteid)
    })
    return foodRecord;

}

async function getFoodRecordById(id) {
    const db = MongoUtil.getDB();
    let foodRecord = await db.collection('food_records').findOne({
        '_id': ObjectId(id)            
    })
    return foodRecord;
}

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
        let foodRecordToBeEdited = await getFoodRecordById(req.params.id);
    
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

    app.get('/food_record/:id/delete', async function(req,res){
        // retrieve from the mongo db the document with the same req.params.id
        const db = MongoUtil.getDB();
        const documentToDelete = await getFoodRecordById(req.params.id);

        res.render('confirm_delete_food_record',{
            'foodRecord': documentToDelete
        })
    })

    app.post('/food_record/:id/delete', async function(req,res){
        const db = MongoUtil.getDB();
        await db.collection('food_records').deleteOne({
            '_id': ObjectId(req.params.id)
        })
        res.redirect('/')
    })

    app.get('/food_record/:id/note/add', async function(req,res){
        const db = MongoUtil.getDB();
        let foodRecord = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.id)
        });
        res.render('add_note',{
            'foodRecord': foodRecord
        })
    })

    app.post('/food_record/:id/note/add', async function(req,res){
        const db = MongoUtil.getDB();
        let noteContent = req.body.note;

        let newNote = {
            '_id': ObjectId(), // create a new ObjectId
            'content': noteContent
        }

        await db.collection('food_records').updateOne({
            '_id': ObjectId(req.params.id),
        },{
            '$push': {
                'notes': newNote
            }
        })

        res.redirect('/food_record/'+req.params.id+'/notes')
    })

    app.get('/food_record/:id/notes', async function(req,res){
        const db = MongoUtil.getDB();
        let foodRecord = await db.collection('food_records').findOne({
            '_id':ObjectId(req.params.id)
        });
        res.render('food_details',{
            'foodRecord': foodRecord
        })
    })

    // edit a note attached to an existing food record document
    app.get('/note/:noteid/update', async function(req,res){

        // to select or to retrieve a sub-document
        // step 1. select the main document that the sub-document belongs to

        const db = MongoUtil.getDB();
        // find the main document which notes array contains the note id that we are looking for
        let results = await getNoteByID(req.params.noteid);
        res.render('update_note',{
            'note': results
        })
    })

    app.post('/note/:noteid/update', async function(req,res){
        const db = MongoUtil.getDB();
        // update the foodRecord where its notes array contain an object that matches
        // req.params.noteid

        let record = await db.collection('food_records').findOne({
            'notes._id': ObjectId(req.params.noteid)
        });

        await db.collection('food_records').updateOne({
            'notes._id': ObjectId(req.params.noteid)
        },{
            '$set': {
                'notes.$.content': req.body.content // $ refers to the index of the element
                                                    // where its _id matches req.params.noteid
            }
        })
        res.redirect('/food_record/'+ record._id+'/notes');
    })

    app.get('/note/:noteid/delete', async function(req,res){
        // retrieve the content of the note that we want to delete
        let noteToDelete = await getNoteByID(req.params.noteid);
        res.render('delete_note',{
            'note': noteToDelete
        })       
    })

    app.post('/note/:noteid/delete', async function(req,res){
      let foodRecord = await getFoodRecordByNote(req.params.noteid);
      const db = MongoUtil.getDB();
      await db.collection('food_records').updateOne({
          '_id': ObjectId(foodRecord._id)
      },{
          '$pull':{
              'notes': {
                  '_id': ObjectId(req.params.noteid)
              }
          }
      })
      res.redirect('/food_record/' + foodRecord._id + '/notes');
    });
   
}
main();


// begin the server
app.listen(3000, function(){
    console.log("server has started");
})


