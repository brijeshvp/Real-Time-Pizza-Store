// another syntax to import modules
import axios from 'axios'   
import Noty from  'noty'
// import { initAdmin } from './admin'
// import moment from 'moment'
// import {initStripe} from './stripe'

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
const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    },2000)
}




// Change order status
let statuses = document.querySelectorAll('.status_line')
// console.log(statuses)
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
// console.log(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    }) 

}

updateStatus(order);

initStripe()

// socket
let socket = io()
// join 
if(order){
    socket.emit('join',`order_${order._id}`)
}

let adminAreaPath = window.location.pathname;
// console.log(adminAreaPath)
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}
// order_(id)   -> name of a private room(unique room for each order will be created)

socket.on('orderUpdated',(data) =>{
    const updatedOrder = {...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    // console.log(data)
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order Updated',
        progressBar:false,
        // layout: 'bottomLeft',    // by default -> topRight
    }).show();
})











