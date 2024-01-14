import {loadStripe} from '@stripe/stripe-js';
import axios from 'axios';
import { placeOrder } from './apiService';
import { CardWidget } from './CardWidget';

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51L996nSAv2MZQ1DpkBXDppPPGZvOGudPgL9ti1MAlzghp60KiG5P8Wyv1fF6yWb3cG2foidWZleKJzb9znuzl1Tq003IrzHgnX');
    let paymentElement = null;
    const paymentType = document.querySelector('#paymentType');

    if(!paymentType){
        return;
    }
    paymentType.addEventListener('change',(e)=>{
        if(e.target.value === 'card'){
            paymentElement = new CardWidget(stripe);
            paymentElement.mount();
        }
        else{
            paymentElement.destroy();
        }
    })

    const paymentForm = document.querySelector('#payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // to prevent form submitting from cart.ejs
            let formData = new FormData(paymentForm);
            let formObj = {};
            for (let [key, value] of formData.entries()) {
                formObj[key] = value;
            }

            if(!paymentElement){
                console.log("not");
                placeOrder(formObj);
                return;   
            }

            const token = await paymentElement.createToken();
            formObj.stripeToken = token.id;
            placeOrder(formObj);
        })
    } 
    
}