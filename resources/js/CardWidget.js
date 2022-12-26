// this is a class file(since capital naming convention)
export class CardWidget{
    stripe = null;
    // style for our card widget mounted in cart.ejs
    style = {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder':{
                color: '#aab7c4'
            }
        },
        invalid:{
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

    paymentElement = null;


    constructor(stripe){
        this.stripe = stripe;
    }

    mount(){
        // follow this for stripe elements: https://stripe.com/docs/js/elements_object/create
        const elements = this.stripe.elements();

        
        // follow this for stripe elements.create: https://stripe.com/docs/js/elements_object/create_payment_element
        // let paymentElement = elements.create('payment',{ style: {} });
        // 2nd arg in elements.create() is optional object
        // 1st option: for styling card widget
        // 2nd option: hidePostalCode : true will hide the zip code from card widget
        this.paymentElement = elements.create('card',{ style: this.style, hidePostalCode : true  });
        // https://stripe.com/docs/js/element/mount
        this.paymentElement.mount('#card-element');
    }

    destroy(){
        this.paymentElement.destroy();
    }

    async createToken(){
        // if pay with card is selected, create stripe token
        try{
            const result = await this.stripe.createToken(this.paymentElement);
            return result.token;
        }catch(err){
            console.log(err);
        }
    }
}