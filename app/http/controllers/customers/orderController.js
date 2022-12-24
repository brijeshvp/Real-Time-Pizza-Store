// mongoose model
const Order = require('../../../models/order')
// js library for date formating
const moment = require('moment')
// const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

// orderController is a factory function -> which creates and returns an object(object creational pattern technique)
const orderController = ()=>{
    // return object containing functions
    return {
        store(req,res){
            // console.log(req.body)
            // return;

            
            // recieve extra informations token number recieved from stripe server after verification and payment type from request body
            const {paymentType,phone, address, stripeToken,} = req.body

            // validate request
            // if phone or address not mentioned, return warning msg

            // since doing ajax call(post req), we have to return json(return res.redirect will not work)
            if(!phone || !address){
                // req.flash('error','All fields are required')
                // return res.redirect('/cart')

                // 422 code is sent when there is any validation error
                return res.status(422).json({message: 'All fields are required'});
            }

            // if everything goes right, create order
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
            })

            // save order
            order.save().then((result) =>{
                // Order.populate() 
                Order.populate(result,{path:'customerId'},(err,placedOrder) =>{
                    // req.flash('success','Order placed successfully')

                    // Stripe payment
                    // if paymentType = card then only run this block
                    if(paymentType === 'card'){
                        stripe.charges.create({
                            // amount will be in:
                            // 1) for rupees -> in paisa
                            // 2) for dollar -> in cents
                            amount: (req.session.cart.totalPrice) * 100,   // convert rupee -> to paise
                            source: stripeToken,
                            currency: 'inr',    // indian national rupee
                            description: `Pizza order: ${placedOrder._id}`  // description will be order id -> this will be stored in stripe transactions.order id is a unique identifier for stripe transactions
                        }).then((res) =>{
                            console.log(res);
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType
                            // we need to save in database again becoz paymentStatus key is changed(to reflect the change in database)
                            // ord will recieve result saved 
                            placedOrder.save().then((ord) =>{
                                // console.log(ord)
                                // Emit on socket here, instead of below
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced',ord)
                                // empty cart after successful order placed
                                delete req.session.cart
                    
                                return res.json({message: 'Payment successful, Order placed successfully'})
                            }).catch((err)=>{
                                console.log(err)
                            })
                        }).catch((err)=>{
                            console.log(err);
                            // empty cart after successful order placed
                            delete req.session.cart
                            // delete cart here also, since payment not successful but order is placed, we are saying them to pay at delivery time
                            return res.json({message: 'Order Placed but Payment failed, you can pay at delivery time'})     
                        })
                    }
                    else{
                        delete req.session.cart
                        return res.json({message: 'Order placed successfully'})
                    }
                    // Emit on socket
                    // const eventEmitter = req.app.get('eventEmitter')
                    // eventEmitter.emit('orderPlaced',placedOrder)

                    // return res.redirect('/customer/orders')   
                })
                
            }).catch(err =>{
                // 500 status code for error
                return res.status(500).json({message: 'Something went wrong'})     
                        
                // req.flash('error','Something went wrong')
                // return res.redirect('/cart')
            })
        },
        // async bcoz find() fn returns promise and have to use await
        async index(req,res){
            // fetch orders from db using find() fn by passing filter object as 1st arg
            // 3rd arg = object to sort all the orders at order section by time(most recent order at 1st row)
            // sort 'createdAt' field
            // to sort in descending order, specify -1
            // when order placed successfully, it shows success alert in order section. but when we come to that page again, it again shows success alert.
            // to avoid that set this res.header()
            const orders = await Order.find({ customerId: req.user._id},null,{sort: {'createdAt': -1}})
            res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-style=0, post-check=0,pre-check=0')
            // render orders on frontend at /customers/orders.ejs
            // also send moment at frontend along with orders so that we can format date and time for each order in order section
            res.render('customers/orders',{orders: orders,moment: moment})
            // console.log(orders)
        },
        async show(req,res){
            const order = await Order.findById(req.params.id)

            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()){
                 return res.render('customers/singleOrder',{order})
            }
            return res.redirect('/')
        }

    }
}

// export to use in web.js
module.exports = orderController