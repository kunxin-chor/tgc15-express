// import in the Express package
// the express variable will have all the objects and funcitonalities provided by the Express package
// the argument to require must match the package name
// the name of the variable is arbitary (meaning you use whatever variable name you want)
const express = require("express");

// create an instance of express application
let app = express(); // the return of the express function call is an instance of an express application


// a route associates an URL (i.e a path) on the server to a function,
// such that when a client requests that URL on the server,
// the associated function will be called
app.get('/about', function(req, res){
    // req stands for request. It will always be the first argument to the route function
    // res stands for response. It will always be the second argument to the route function

    // send back the string "Hello World" to the client
    res.send("Hello World")
})

app.get('/', function(req,res){
    res.send("Goodbye world")
})

app.get('/contact', function(req,res){
    res.send("<h1>Breaking News</h1><h2>The cheese is made out moon</h2>");
})

app.get('/luckynumber', function(req,res){
    let lucky = Math.floor(Math.random() * 100 + 1);
    res.send("<h1>our lucky number is " + lucky + "</h1>");
})





// start the server
// 3000 is the port number. Port numbers are basically 'addresses' on your computer.

app.listen(3000, function(){
    console.log("Server has started");
})