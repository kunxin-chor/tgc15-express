// import in the packages
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on')

let app = express();
app.use(express.json()); // allows clients (such as browsers) to send JSON requests to our Express server

// ROUTES
app.get('/', function(req,res){
    res.send("Hello world");
})

// START SERVER
app.listen(3000, function(req,res){
    console.log("Server started")
})