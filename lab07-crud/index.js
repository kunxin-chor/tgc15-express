// SETUP
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');

let app = express();
// set which view engine to use
app.set('view engine', 'hbs');

// set where to find the static files
app.use(express.static('public'))

// setup wax on for template inhteritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// setup forms
app.use(express.urlencoded({
    extended:false
}))

const API_BASE_URL = 'https://ckx-restful-api.herokuapp.com/'

// ROUTES
app.get('/', async function(req,res){
    // get all the sightings and display them in a table
    const response = await axios.get( API_BASE_URL + 'sightings/');
    let sightings = response.data;
    res.render('sightings',{
        'sightings': sightings
    })
})

// route is to render the form
app.get('/create_sighting',  function(req,res){
    res.render('create_sighting');
})

// route is to process the form
app.post('/create_sighting', async function(req,res){
    let food = req.body.food.split(',');
    let description = req.body.description;
    let datetime = req.body.datetime;
    await axios.post(API_BASE_URL + "sighting",{
        "description": description,
        "food": food,
        "datetime": datetime
    });
    res.redirect('/');

})

app.get("/update_sighting/:sighting_id", async function(req,res){
    let sightingId = req.params.sighting_id;
    // In the API endpoint, there is a endpoint which is:
    // GET sighting/<id of the object>
    let response = await axios.get(API_BASE_URL + "sighting/" + sightingId);
    let sighting = response.data;
    sighting.datetime = sighting.datetime.slice(0, -1);
    res.render('update_sighting',{
        'sighting': sighting
    })
})

app.post('/update_sighting/:sighting_id', async function(req,res){
    let sightingId = req.params.sighting_id;
    let updatedFoodSighting = {
        'description': req.body.description,
        'food': req.body.food.split(','),
        'datetime': req.body.datetime
    }
    await axios.put(API_BASE_URL + 'sighting/' + sightingId, updatedFoodSighting);
    res.redirect('/')
})

app.get('/delete_sighting/:sighting_id', async function(req,res){
    // retrieve the sighting id from the url parameters
    let sightingId = req.params.sighting_id;

    // retrieve information of the sighting using the api
    let response = await axios.get(API_BASE_URL + "sighting/" + sightingId);
    let sighting = response.data;

    res.render('delete_sighting', {
        'sighting': sighting
    })
})

app.post('/delete_sighting/:sighting_id', async function(req,res){
    let sightingId = req.params.sighting_id;
    await axios.delete(API_BASE_URL + "sighting/" + sightingId);
    res.redirect('/');
})

// LISTEN
app.listen(3000, ()=>{
    console.log("Server started");
})