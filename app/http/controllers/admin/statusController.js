// mongoose model
const Order = require('../../../models/order')

// statusController is a factory function -> which creates and returns an object(object creational pattern technique)
const statusController = ()=>{
    // return object containing functions
    return {
        // update status of order from admin section in real time
        update(req,res){
            // we are recieving 2 things from resources/js/admin.js: 1) orderId and 2) order status in out post request(see name attributes in form in admin.js)
            // req.body.<nameAttributes> can be accessed here
            // 1st arg = filter object to choose which entry to update
            // 2nd arg = field to update in db(we have to update status from admin side in real time)
            // orderId is name of hidden field and status is name of order status in frontend(see admin.js)
            // updated data will be recieved in callback fn in 3rd arg 
            Order.updateOne({_id: req.body.orderId},{status: req.body.status},(err,data) => {
                if(err){
                    return res.redirect('/admin/orders')
                }
                // whenever status updated, send msg(event) in private room created that our order status is updated so that we can recieve status update in real time in front end
                // Emit event

                // get emitter anywhere in our app using req.app.get(key)
                // we have used key as eventEmitter(refer server.js emitter config)
                const eventEmitter = req.app.get('eventEmitter')
                // emit an event 
                // 1st arg = event name
                // 2nd arg = data to be sent as obj(where this event will be listened -> at socket in app.js)
                eventEmitter.emit('orderUpdated',{id: req.body.orderId,status: req.body.status})

                // after updating status, stay at same page at admin side
                return res.redirect('/admin/orders/')
            })
        }
    }
}

// export and recieve it in web.js
module.exports = statusController