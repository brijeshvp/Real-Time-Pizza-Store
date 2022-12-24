// mongoose model
const Menu = require('../../models/menu')

// homeController is a factory function -> which creates and returns an object(object creational pattern technique)
const homeController = ()=>{
    // return object containing function
    return{
        // index is naming convention for home page
        // es6 feature: when specifying function inside object, key not required(function name = key)
        // this has to be async function bcoz: 
        // we use await inside function to fetch pizzas from db using mongoose model which returns a promise
        // NOTE:- req,res will be automatically recieved in 2nd arg of app.get() or app.post() 
        // in our case 2nd arg is this controller's index function
        async index(req,res){
            // to fetch all pizzas from db
            const pizzas = await Menu.find()
            console.log(pizzas)
            return res.render('home',{pizzas:pizzas})
        }
    }
}

// export and recieve it in web.js
module.exports = homeController