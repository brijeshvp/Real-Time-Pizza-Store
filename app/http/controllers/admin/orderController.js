// this orderController will be shown at order section at admin side

// mongoose model
const Order = require('../../../models/order')

// orderController is a factory function -> which creates and returns an object(object creational pattern technique)
const orderController = ()=>{
    // return object containing functions
    return {
        index(req,res){
            // fetch only not completed orders
            // {status: {$ne: 'completed'}} means status is not equal to completed
            // {sort:{'createdAt': -1}} to sort orders in decreasing order of time(most recent first)

            // refer this guide on populate(excellent guide): https://www.geeksforgeeks.org/mongoose-populate-method/
            // -password means don't fetch password(for security - no need of user password in order details)
            Order.find({status: {$ne: 'completed'}},null,{sort:{'createdAt': -1}}).populate('customerId','-password').exec((err,orders) =>{
                // we are doing get request from admin.js using axios in ajax form(since in headers we mentioned xhr request) to get all orders at admin.js
                // but since xhr request, we need to send all orders in json form
                // also since xhr request, check using req.xhr
                if(req.xhr){
                    return res.json(orders)
                }

                // if its not ajax call, directly render admin/orders.ejs page
                return res.render('admin/orders')
            })

        }
    }
}

// export and recieve it in web.js
module.exports = orderController