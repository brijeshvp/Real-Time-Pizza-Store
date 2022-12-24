// to get access of dotenv(.env) file in server.js include dotenv and call config() method
require('dotenv').config()
const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');

// by default, express server don't understand json data
// to recieve json data in req and res, specify it to express
app.use(express.json());


// db connection
// Import the mongoose module
const mongoose = require("mongoose");
// Set up default mongoose connection
const url = process.env.MONGO_CONNECTION_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
// Get the default connection
const connection = mongoose.connection;
// // Bind connection to error event (to get notification of connection errors)
// connection.on("error", console.error.bind(console, "MongoDB connection error:"));
connection.once('open', () =>{
    console.log('Database connected...');
})

// flash config
const flash = require("express-flash");
app.use(flash());   // use flash as a middleware in express



// session config
const session = require('express-session');
// to store sessions in mongodb
const MongoDbStore = require('connect-mongo');
// any session require cookies for their working. and we need to encrypt the cookies using secret key
// store secret keys,api keys,passwords in .env file
// NOTE:- life time of session = life time of cookie

// Guide to use express-session: https://www.npmjs.com/package/express-session
// Guide to use mongodb store with session: https://github.com/jdesboeufs/connect-mongo
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    // specify store here to store sessions 
    store: MongoDbStore.create({
      mongoUrl: url
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  }))
//   NOTE: in banking apps, cookie time is very less e.g. 5-15mins for security reasons


// NOTE:- keep this global middleware below session definition and configuration else error
// global middleware
// by default, session is not available in front-end
// so specify session globally
// then it will be available 
app.use((req,res,next)=>{
  res.locals.session = req.session
  next()  // call this next() function to process req further, else page will keep loading
})


// port
let PORT = process.env.PORT || 3000;

// specify static dir to express(so that it can run css and js)
// default MIME type is text/html
// if not specify this, css and js will not run
app.use(express.static('public'));


// set template engine
app.use(expressLayout); // tells express which layouts to use
// this will search layout.ejs in folder we specify as views(so make sure to create layout.ejs in views folder else error)
// this express-ejs-layouts will help us to avoid writing repetitive code(template inheritance)
// nav, footer and base ejs code will be kept in layout.ejs


// just like any template engine, ejs helps embed data from server side into html dynamically
app.set('view engine','ejs'); // specify template engine to use
app.set('views',path.join(__dirname,'/resources/views'));   // specify views/templates directory


// all endpoints in /routes/web.js/initRoutes
// call the function initRoutes and pass app object so we can do request like app.get, app.post, etc from there
const initRoutes = require('./routes/web');
initRoutes(app);

// Start server
app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})