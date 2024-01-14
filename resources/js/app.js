import axios from 'axios'   
import Noty from  'noty'
import { initAdmin } from './admin.js'
import moment from 'moment'
import {initStripe} from './stripe'

let cartCounter = document.querySelector('#cartCounter')

const updateCart = (pizza)=>{
    axios.post('/update-cart',pizza).then((res) =>{
        cartCounter.innerText = res.data.totalQty

        new Noty({
            type: 'success',    // bg-color = green
            timeout: 1000,  // hide after 1 sec
            text: 'Item added to cart',
            progressBar:false,  // hide progress bar
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
            // layout: 'bottomLeft',    // by default -> topRight
        }).show();
    })
}

let addToCart = document.querySelectorAll('.add-to-cart')
addToCart.forEach((btn) => {
    btn.addEventListener('click',(e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})

const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    },2000)
}

let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)

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

let socket = io()
if(order){
    socket.emit('join',`order_${order._id}`)
}


let adminAreaPath = window.location.pathname;
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}

socket.on('orderUpdated',(data) =>{
    const updatedOrder = {...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status

    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order Updated',
        progressBar:false,
        // layout: 'bottomLeft',    // by default -> topRight
    }).show();
})