// another syntax to import modules
import axios from 'axios'   
import Noty from  'noty'
// import from admin.js
import { initAdmin } from './admin.js'
import moment from 'moment'
import {initStripe} from './stripe'

// get span tag in navbar near cart icon to display totalQty in cart 
let cartCounter = document.querySelector('#cartCounter')

const updateCart = (pizza)=>{
    // 1st arg = url, 2nd arg = data to be sent
    // returns a promise so use .then() which recieves response 
    axios.post('/update-cart',pizza).then((res) =>{
        // console.log(res)

        // set totalQty in cartCounter
        cartCounter.innerText = res.data.totalQty

        // display notifications using Noty
        new Noty({
            type: 'success',    // bg-color = green
            timeout: 1000,  // hide after 1 sec
            text: 'Item added to cart',
            progressBar:false,  // hide progress bar

            // layout: 'bottomLeft',    // by default -> topRight
        }).show();
    // if error in post request
    }).catch(err => {
        // display error msg using noty
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
            // layout: 'bottomLeft',    // by default -> topRight
        }).show();
    })
}

// get all the btns with add-to-cart class
let addToCart = document.querySelectorAll('.add-to-cart')
// now we have all btns as array in addToCart
// so use forEach loop
// inner function will recieve each btn
// add event listener on each btn
addToCart.forEach((btn) => {
    btn.addEventListener('click',(e) => {
        // get the data attribute from home.ejs add-to-cart btn
        // convert to json bcoz data attribute recieves string
        let pizza = JSON.parse(btn.dataset.pizza)
        // update cart with given pizza
        updateCart(pizza)
        // console.log(pizza)
    })
})


// remove alert message after X seconds
// capture sucess alert at order section here
const alertMsg = document.querySelector('#success-alert')
// if there is sucess alert to show, remove it after 2 secs
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    },2000)
}

// // works here
// initAdmin(socket);

// Change order status logic
// fetch status name's li tag from single order page
// statuses is array of li's
let statuses = document.querySelectorAll('.status_line')
// console.log(statuses)

// fetch hiddenInput element from singleOrder frontend page whose value is order details in string form  
let hiddenInput = document.querySelector('#hiddenInput')
// if order there, then give order in string form(which is value in hiddenInput) else store null
let order = hiddenInput ? hiddenInput.value : null
// convert order string in order object back
order = JSON.parse(order)
// console.log(order)


// create small tag to show status update time in previously completed status
let time = document.createElement('small')

function updateStatus(order) {
    // statuses is array of li's containing status names from single order page
    // so we can use forEach loop on array
    // first remove completed and current class from status which is going to complete so that its color turns to gray(and not primary)
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })

    // for 1st step, let stepCompleted = true always initially
    let stepCompleted = true;
    statuses.forEach((status) => {
        // fetch value of 'status' data attribute of each status names
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
    //    if value of dataProp is same as order status(in db), show time in previously completed status and make current status color = primary
       if(dataProp === order.status) {
            // for next current status, stepCompleted will be false
            stepCompleted = false
        // show status update time in this status(since it is completed)
        // updatedAt is field automatically added in db for any document
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            // insert this small tag in this status, which is going to complete
            status.appendChild(time)
            // if there is next status available, make it next current (by adding current class, its color bcomes primary)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
           
       }
    }) 

}

updateStatus(order);

initStripe()

// socket
// this io we get bcoz we include socket.io script in layout.ejs
let socket = io()
// join 
// whenever browser comes to single order page(order is true), room will be created with name = order id and browser will join that room
if(order){
    // 1st arg = event name
    // 2nd arg = data to be sent to our express server.js = order_<orderId> = our private room name
    socket.emit('join',`order_${order._id}`)
}


// using private room for recieving orders in real time in admin order section
// to get url of the page
let adminAreaPath = window.location.pathname;
// console.log(adminAreaPath)
// to identify if we are on the admin page or not
// if we are on the admin side, emit the same event having key = 'join'
// 1st arg = event key
// 2nd arg = room name(since only one room for admin, we can keep name = adminRoom -> no need to use id -> we used id for order bcoz for each order we need a seperate room, but here only one room on admin side)
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}
// order_(id)   -> name of a private room(unique room for each order will be created)


// listen to event emitted from private room
// 1st arg = event name
// 2nd arg = fn recieving data emitted along with event from private room
socket.on('orderUpdated',(data) =>{
    // get order obj copy
    const updatedOrder = {...order }
    // update order status's update time with current time
    updatedOrder.updatedAt = moment().format()
    // update updated status coming from data in emitted from private room
    updatedOrder.status = data.status
    // console.log(data)

    // now call updateStatus fn with updated order obj
    updateStatus(updatedOrder)
    // also notify on user's single order page about order update
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order Updated',
        progressBar:false,
        // layout: 'bottomLeft',    // by default -> topRight
    }).show();
})










