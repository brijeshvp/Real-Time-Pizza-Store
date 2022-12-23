const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');

// port
let PORT = process.env.PORT || 3300;

// not working
// // set template engine
// app.use(expressLayout); // tells express which layouts to use

// just like any template engine, ejs helps embed data from server side into html dynamically
app.set('view engine','ejs'); // specify template engine to use
app.set('views',path.join(__dirname,'/resources/views'));   // specify views/templates directory


// endpoints
app.get('/',(req,res)=>{
    res.render("home");
})

// Start server
app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})