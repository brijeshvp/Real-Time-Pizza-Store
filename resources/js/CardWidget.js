export class CardWidget{
    stripe = null;
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
        const elements = this.stripe.elements();
        this.paymentElement = elements.create('card',{ style: this.style, hidePostalCode : true  });
        this.paymentElement.mount('#card-element');
    }

    destroy(){
        this.paymentElement.destroy();
    }

    async createToken(){
        try{
            const result = await this.stripe.createToken(this.paymentElement);
            return result.token;
        }catch(err){
            console.log(err);
        }
    }
}