const Order = require('../../../models/order')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const orderController = ()=>{
    return {
        store(req,res){
            const {paymentType,phone, address, stripeToken,} = req.body

            if(!phone || !address){
                return res.status(422).json({message: 'All fields are required'});
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
            })

            order.save().then((result) =>{
                Order.populate(result,{path:'customerId'},(err,placedOrder) =>{
                    if(paymentType === 'card'){
                        stripe.charges.create({
                            amount: (req.session.cart.totalPrice) * 100,   // convert rupee -> to paise
                            source: stripeToken,
                            currency: 'inr',    // indian national rupee
                            description: `Pizza order: ${placedOrder._id}`  // description will be order id -> this will be stored in stripe transactions.order id is a unique identifier for stripe transactions
                        }).then((res) =>{
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType
                            placedOrder.save().then((ord) =>{
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced',ord)
                                delete req.session.cart
                    
                                return res.json({message: 'Payment successful, Order placed successfully'})
                            }).catch((err)=>{
                                console.log(err)
                            })
                        }).catch((err)=>{
                            console.log(err);
                            delete req.session.cart
                            return res.json({message: 'Order Placed but Payment failed, you can pay at delivery time'})     
                        })
                    }
                    else{
                        delete req.session.cart
                        return res.json({message: 'Order placed successfully'})
                    }
                })
                
            }).catch(err =>{
                return res.status(500).json({message: 'Something went wrong'})     
            })
        },
        async index(req,res){
            const orders = await Order.find({ customerId: req.user._id},null,{sort: {'createdAt': -1}})
            res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-style=0, post-check=0,pre-check=0')
            res.render('customers/orders',{orders: orders,moment: moment})
        },
        async show(req,res){
            const order = await Order.findById(req.params.id)
            if(req.user._id.toString() === order.customerId.toString()){
                 return res.render('customers/singleOrder',{order})
            }
            return res.redirect('/')
        }

    }
}

module.exports = orderController