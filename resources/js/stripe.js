// follow github page for code guide on stripe: https://github.com/stripe/stripe-js
// import loadStripe fn from stripe package
import {loadStripe} from '@stripe/stripe-js';
import axios from 'axios';
// axios ajax call is kept in seperate file in placeOrder function
import { placeOrder } from './apiService';
import { CardWidget } from './CardWidget';

export async function initStripe() {
    // include stripe publishable(client) key
    const stripe = await loadStripe('pk_test_51L996nSAv2MZQ1DpkBXDppPPGZvOGudPgL9ti1MAlzghp60KiG5P8Wyv1fF6yWb3cG2foidWZleKJzb9znuzl1Tq003IrzHgnX');

    // this will store payment element created inside mountWidget fn
    // i have defined it outside the fn to use outside the fn
    let paymentElement = null;
    // function mountWidget(){
    //     // follow this for stripe elements: https://stripe.com/docs/js/elements_object/create
    //     const elements = stripe.elements();

    //     // style for our card widget mounted in cart.ejs
    //     let style = {
    //         base: {
    //             color: '#32325d',
    //             fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //             fontSmoothing: 'antialiased',
    //             fontSize: '16px',
    //             '::placeholder':{
    //                 color: '#aab7c4'
    //             }
    //         },
    //         invalid:{
    //             color: '#fa755a',
    //             iconColor: '#fa755a'
    //         }
    //     };
    //     // follow this for stripe elements.create: https://stripe.com/docs/js/elements_object/create_payment_element
    //     // let paymentElement = elements.create('payment',{ style: {} });
    //     // 2nd arg in elements.create() is optional object
    //     // 1st option: for styling card widget
    //     // 2nd option: hidePostalCode : true will hide the zip code from card widget
    //     paymentElement = elements.create('card',{ style: style, hidePostalCode : true  });
    //     // https://stripe.com/docs/js/element/mount
    //     paymentElement.mount('#card-element');
    // }


    // get the select box from cart page to select card/cod payment
    const paymentType = document.querySelector('#paymentType');
    // this is done so that we do not get add event listener to null error on other pages than cart(bcoz select box will not be there on other pages)
    // so if select box is not there simply return and don't execute further logic
    if(!paymentType){
        return;
    }
    // on changing select box option in payment option in cart page, this event will be fired
    paymentType.addEventListener('change',(e)=>{
        // console.log(e);
        // console.log(e.target.value);

        if(e.target.value === 'card'){
            // display stripe card widget 
            // mountWidget();
            paymentElement = new CardWidget(stripe);
            paymentElement.mount();
        }
        else{
            // else don't display card widget(destroy the created widget)
            paymentElement.destroy();
        }
    })

    const paymentForm = document.querySelector('#payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // to prevent form submitting from cart.ejs
            // get order now cart page's form data here
            // using FormData object of js(inbuilt class in js)
            let formData = new FormData(paymentForm);
            console.log(formData);
            // console.log(formData.entries());
            let formObj = {};
            for (let [key, value] of formData.entries()) {
                // console.log(key,value);
                formObj[key] = value;
            }
            // console.log(formObj);


            // verify card(token) before doing ajax call
            // if cod is selected(paymentElement is null)
            if(!paymentElement){
                // simply do the ajax call and don't execute further logic
                placeOrder(formObj);
                return;   
            }

            //  CREATE PAYMENT INTENT HERE  

            // // if pay with card is selected, create stripe token
            const token = await paymentElement.createToken();
            formObj.stripeToken = token.id;
            placeOrder(formObj);
            // stripe.createToken(paymentElement).then((result)=>{
            //     // console.log(result);
            //     // add token details in formObj
            //     formObj.stripeToken = result.token.id;
            //     // and then make ajax call to server(to place order)
            //     placeOrder(formObj);
            // }).catch((err)=>{
            //     console.log(err);
            // })
        })
    } 
    
}