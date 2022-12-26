// import controllers
const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const statusController = require('../app/http/controllers/admin/statusController')

// import middlewares
// refer guest middleware to understand more about this middlewares
const guest = require('../app/http/middlewares/guest')  // this middleware is used to specify usage of /login and /register routes to user
const auth = require('../app/http/middlewares/auth')  // this middleware is used to protect secure routes like order section and allowing only authenticated/logged-in users to access them
const admin = require('../app/http/middlewares/admin') // this middleware is used to allow only admin to access admin order section(admin dashboard)

// app is a express() object
// all objects are passed by reference to any function in js
// export this function to server.js and pass app object here from there
const initRoutes = (app)=> {
    // 2nd arg of app.get(), app.post(),etc.. request, is a call back function having req,res as arg
    // this callbacks we will keep in controllers because when serving post requests, we may need to write big logic
    // to keep code clean use controllers and write callback there

    // callback function is index method which is inside the object returned by homeController function(same for below routes also)
    const homeControllerObj = homeController()
    app.get('/',homeControllerObj.index)

    // auth routes
    const authControllerObj = authController()
    // get login will provide login page to user
    // provide guest middleware to get login
    // bcoz when user specify /login route, we want to specify usage of /login route
    app.get('/login',guest,authControllerObj.login)
    // post login will be used to submit login details to server and login user
    app.post('/login',authControllerObj.postLogin)
    // provide guest middleware to get register
    // bcoz when user specify /register route, we want to specify usage of /register route
    app.get('/register',guest,authControllerObj.register)
    app.post('/register',authControllerObj.postRegister)
    app.post('/logout',authControllerObj.logout)
    
    // cart routes
    const cartControllerObj = cartController()
    app.get('/cart',cartControllerObj.index)
    app.post('/update-cart',cartControllerObj.update)

    // user order page routes
    const orderControllerObj = orderController()
    app.post('/orders',orderController().store)
    app.post('/orders',auth, orderControllerObj.store)
    app.get('/customer/orders', auth,orderControllerObj.index)
    // :id denotes that it is dynamically changed for each order
    // this is order tracking page where order status will be updated in real time at user side
    app.get('/customer/orders/:id', auth,orderControllerObj.show)

    // admin routes
    // const adminOrderControllerObj = adminOrderController()
    app.get('/admin/orders',admin,adminOrderController().index)

    const statusControllerObj = statusController();
    app.post('/admin/order/status',admin,statusControllerObj.update)
}

// export module(web.js) and import in server.js so that we can pass app express object to this file
// only function initRoutes will be exported
module.exports = initRoutes