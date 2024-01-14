const stripe = require('stripe')('sk_test_51L996nSAv2MZQ1Dp3Ctyq7ddrO0MVjUFZUVHMcUEZOMSxR6evTlChVPg0SPtmuWOJQBbeinGywOS9qYyDayFGl3P007dyI2tMR');
const cartController = ()=>{
    return{
        async index(req,res){
            res.render('customers/cart');
        },
        update(req, res) {
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }
            let cart = req.session.cart;

            if(!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }
            else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice =  cart.totalPrice + req.body.price
            }

            return res.json({ totalQty: req.session.cart.totalQty })
        }
    }
}

module.exports = cartController