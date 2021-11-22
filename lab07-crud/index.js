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

// LISTEN
app.listen(3000, ()=>{
    console.log("Server started");
})