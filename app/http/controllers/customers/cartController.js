// cartController is a factory function -> which creates and returns an object(object creational pattern technique)
const cartController = ()=>{
    // return object containing functions
    return{
        index(req,res){
            res.render('customers/cart')
        },
        update(req, res) {
            // format to store data in cart:-
            // let cart = {
            //     items: {
            //         pizzaId: { item: pizzaObject, qty:0 },
            //         pizzaId: { item: pizzaObject, qty:0 },
            //         pizzaId: { item: pizzaObject, qty:0 },
            //     },
            //     totalQty: 0,
            //     totalPrice: 0
            // }

            // for the first time creating cart
            // if no cart exists, create empty cart and add above format
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }
            let cart = req.session.cart;

            // console.log(req.body)

            // if item does not exist in cart, add it with qty 1 
            // req.body is pizza obj
            // req.body._id is pizza id
            if(!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }
            // if item already exists, just increase its qty
            else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice =  cart.totalPrice + req.body.price
            }
            // in both cases, totalQty and totalPrice will be increased

            // send totalQty in response to display in cart btn in navbar
            return res.json({ totalQty: req.session.cart.totalQty })
        }
    }
}

// export and recieve it in web.js
module.exports = cartController