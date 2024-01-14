const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const statusController = require('../app/http/controllers/admin/statusController')

const guest = require('../app/http/middlewares/guest')  // this middleware is used to specify usage of /login and /register routes to user
const auth = require('../app/http/middlewares/auth')  // this middleware is used to protect secure routes like order section and allowing only authenticated/logged-in users to access them
const admin = require('../app/http/middlewares/admin') // this middleware is used to allow only admin to access admin order section(admin dashboard)

const initRoutes = (app)=> {
    const homeControllerObj = homeController()
    app.get('/',homeControllerObj.index)

    const authControllerObj = authController()
    app.get('/login',guest,authControllerObj.login)
    app.post('/login',authControllerObj.postLogin)
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
    app.get('/customer/orders/:id', auth,orderControllerObj.show)

    // admin routes
    app.get('/admin/orders',admin,adminOrderController().index)

    const statusControllerObj = statusController();
    app.post('/admin/order/status',admin,statusControllerObj.update)
}

module.exports = initRoutes