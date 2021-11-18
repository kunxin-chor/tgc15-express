const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// 1. create a new express application
let app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts'); // inform wax-on where to find the layout files

// enable form processing
app.use(express.urlencoded({
    'extended': false
}))

// 2. define the routes
app.get('/', function(req,res){
    res.render('home');
})

app.get('/about', function(req,res){
    res.render('about')
})

app.get('/contact-us', function(req,res){
    res.render('contact-us')
})

app.post('/contact-us', function(req,res){
    console.log(req.body);
    let hearAbout = [];
    // check if hear_about exists in req.body
    if (req.body.hear_about) {
        if (!Array.isArray(req.body.hear_about)) {
            // if hearAbout is not undefined but not an array
            // it has to be a string
            hearAbout.push(req.body.hear_about)
        } else {
            hearAbout = req.body.hear_about;
        }
    }
    console.log("hearAbout =>", hearAbout);
    res.send("form recieved");
})

app.get('/menu', function(req,res){
    let promotion = false;
    let days = ["Monday", "Wedensday", "Thursday", "Saturday"];
    let menu = [
        {
            "name": "Raw Salmon on Rice",
            "cost": 5.50,
            "desc": "Salmon lightly broiled on Japanese rice",
            "image":"https://images.squarespace-cdn.com/content/v1/5bff85572971146fb81d6d24/1590333005883-XRBKOQQQCGNZRLHFQU2W/japanese+mirin+soy+glazed+salmon?format=1000w"
        },
        {
            "name": "Hand-rolled crab sushi",
            "cost": 3.50,
            "desc": "Crab rolled together with sweeten Japanese rice",
            "image":"https://images.arigatotravel.com/2020/01/28161044/shutterstock_1140852635.jpg"
        }
    ]
    res.render('menu',{
        'promotion': promotion,
        'daysOpen': days,
        'menu':menu
    })
})



// 3. start the server
app.listen(3000, function(){
    console.log("Server has started");
})