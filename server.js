const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');

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


// endpoints
app.get('/',(req,res)=>{
    res.render("home");
})
app.get('/cart',(req,res)=>{
    res.render("customers/cart");
})
app.get('/login',(req,res)=>{
    res.render("auth/login");
})
app.get('/register',(req,res)=>{
    res.render("auth/register");
})

// Start server
app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})