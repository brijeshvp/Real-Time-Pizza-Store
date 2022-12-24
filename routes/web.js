// import controllers
const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
// const orderController = require('../app/http/controllers/customers/orderController')
// const AdminOrderController = require('../app/http/controllers/admin/orderController')
// const statusController = require('../app/http/controllers/admin/statusController')

// // import middlewares
// const guest = require('../app/http/middlewares/guest')  
// const auth = require('../app/http/middlewares/auth')  
// const admin = require('../app/http/middlewares/admin')  

// app is a express() object
// all objects are passed by reference to any function in js
// export this function to server.js and pass app object here from there
function initRoutes(app){
    // 2nd arg of app.get(), app.post(),etc.. request, is a call back function having req,res as arg
    // this callbacks we will keep in controllers because when serving post requests, we may need to write big logic
    // to keep code clean use controllers and write callback there

    // callback function is index method which is inside the object returned by homeController function(same for below routes also)
    const homeControllerObj = homeController()
    app.get('/',homeControllerObj.index)

    // auth routes
    const authControllerObj = authController()
    // app.get('/login',guest,authControllerObj.login)
    // app.post('/login',authControllerObj.postLogin)
    // app.get('/register',guest,authControllerObj.register)
    // app.post('/register',authControllerObj.postRegister)
    app.post('/logout',authControllerObj.logout)
    
    // cart routes
    const cartControllerObj = cartController()
    app.get('/cart',cartControllerObj.index)
    app.post('/update-cart',cartControllerObj.update)

    // // customer routes
    // app.post('/orders',orderController().store)
    // app.post('/orders',auth, orderController().store)
    // app.get('/customer/orders', auth,orderController().index)
    // app.get('/customer/orders/:id', auth,orderController().show)

    // // admin routes
    // app.get('/admin/orders',admin,AdminOrderController().index)
    // app.post('/admin/order/status',admin,statusController().update)
}

// export module(web.js) and import in server.js so that we can pass app express object to this file
// only function initRoutes will be exported
module.exports = initRoutes