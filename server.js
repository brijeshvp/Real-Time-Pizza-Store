// to get access of dotenv(.env) file in server.js include dotenv and call config() method
require('dotenv').config()
const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
// import passport module
const passport = require('passport');
// import passport configuration file 
const passportInit = require('./app/config/passport');

// by default, express server don't understand json data
// to recieve json data in req and res, specify it to express
app.use(express.json());
// when recieving data using post request from forms, data is url encoded
// by default, express server don't understand url encoded data
// specify explicitly
app.use(express.urlencoded({extended:false}));


// flash config
const flash = require("express-flash");
app.use(flash());   // use flash as a middleware in express
// to display flash msg in frontend, specify to express



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
// to store sessions in mongodb
const MongoDbStore = require('connect-mongo');



// event emitters follows pop-ups architecture
// we can fire an event from anywhere in our nodejs app and can listen at some other place in our app.
// this way we can keep files seperately and communicate info betn files in our app.

// in our case, we want to emit an event from statusController.js in admin when order status is updated. so that event can be listen by socket and order status reflected in frontend in real time
const Emitter = require('events') // node.js built in module = events
// Event emitter
// create Emitter obj
const eventEmitter = new Emitter()
// specify express app that we are using event emitter(to use emitter in entire express app)
// app.set() 1st arg = key using which we can access the emitter and 2nd arg = emitter obj
app.set('eventEmitter',eventEmitter)
// now we can use emitter in our entire app


// session config
const session = require('express-session');

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



// NOTE: keep passport config after session config since passport uses sessions. else error
// passport config
// Guide: https://www.npmjs.com/package/passport

// pass passport module in /app/config/passport to configure it there
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());
// If your application uses persistent login sessions (recommended, but not required), passport.session() middleware must be used.


// NOTE:- keep this global middleware below session definition and configuration else error
// global middleware
// by default, session and logged-in user is not available in front-end
// so specify session and logged-in user globally
// then it will be available 
app.use((req,res,next)=>{
  res.locals.session = req.session
  res.locals.user = req.user
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
const server = app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})


// socket config
// import socket.io
const io= require('socket.io')
// call io by passing server(return value of app.listen()) so that socket.io keep watch on our server for real time communication
io(server)
// on socket connection, we recieve socket in callback fn
io.on('connection',(socket) =>{
  // for every order, we create private room(bcoz socket will listen single order page of particular order)
  // user's browser will join this private room when it is in single order page
  // whenever order status changes, event will be emitted and accordingly we will update the order status
  // private room name must be unique, so that socket can identify which order room belongs to.
  // so order id must be private room's name(always unique)

  // console.log(socket.id)

  // we have emitted join event from app.js so capture it here with room name = arg in callback fn
  socket.on('join',(orderId) =>{
  // console.log(orderId)

  // join the room
    socket.join(orderId)
  })
})
// now go to statusController.js in admin

// we have emitted an event from statusController.js in admin

// now we can listen to that event using emitter obj.on() method
// 1st arg = event name which is emitted
// 2nd arg = fn recieving data sent from emitted event
eventEmitter.on('orderUpdated',(data) =>{
  // io.to() is used to send msg in private room
  // arg = room name
  // .emit() is used to emit an event in specified room
  // 1st arg = event name
  // 2nd arg = data to be sent along with event 
  io.to( `order_${data.id}`).emit('orderUpdated',data)
})
// now goto app.js to listen this event


// listen to orderPlaced named event emitted from orderController of customers, to get order details in real time at admin side
// 2nd arg = fn recieving order data
eventEmitter.on('orderPlaced',(data) =>{
  // send data to adminRoom named private room(the only room for admin) and emit the event named orderPlaced to listen in admin.js
  io.to('adminRoom').emit('orderPlaced',data)
})

// 404 page
app.use((req,res) =>{
  // res.status(404).send('<h1> 404, Page not found</h1>')
  res.status(404).render('errors/404')
})