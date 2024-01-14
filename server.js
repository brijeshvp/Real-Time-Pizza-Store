require('dotenv').config()
const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const passport = require('passport');
const passportInit = require('./app/config/passport');

app.use(express.json());
app.use(express.urlencoded({extended:false}));


const flash = require("express-flash");
app.use(flash());   // use flash as a middleware in express

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);

const url = process.env.MONGO_CONNECTION_URL


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () =>{
    console.log('Database connected...');
})
const MongoDbStore = require('connect-mongo');

const Emitter = require('events') // node.js built in module = events
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

const session = require('express-session');

app.use(session({
    secret: "thisismysecret",     
    resave: false,
    store: MongoDbStore.create({
      mongoUrl: url
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  }))

  passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  res.locals.session = req.session
  res.locals.user = req.user
  next()  // call this next() function to process req further, else page will keep loading
})

// port
let PORT = process.env.PORT || 4000;
app.use(express.static('public'));


// set template engine
app.use(expressLayout); // tells express which layouts to use

app.set('view engine','ejs'); // specify template engine to use
app.set('views',path.join(__dirname,'/resources/views'));   // specify views/templates directory

const initRoutes = require('./routes/web');
initRoutes(app);

app.use((req,res)=>{
  res.status(404).render('errors/404');
})

// Start server
const server = app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})

const io = require('socket.io')(server);
 
io.on('connection',(socket) =>{
  socket.on('join',(orderId) =>{
    socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated',(data) =>{
  io.to( `order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data) =>{
  io.to('adminRoom').emit('orderPlaced',data)
})