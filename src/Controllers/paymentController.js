import PaymentService from '../Services/paymentService.js';

class PaymentController {
    // Create payment intent
    static async createPaymentIntent(req, res) {
        try {
            const { amount, currency = 'usd' } = req.body;
            
            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(400).json({ error: 'Valid amount is required' });
            }

            const paymentIntent = await PaymentService.createPaymentIntent(
                amount, 
                currency,
                { userId: req.user._id.toString() }
            );

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });
            
        } catch (error) {
            console.error('Payment error:', error);
            res.status(500).json({ 
                error: error.message || 'Payment processing failed' 
            });
        }
    }

    // Handle payment success webhook
    static async handlePaymentSuccess(req, res) {
        try {
            const sig = req.headers['stripe-signature'];
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
            
            let event;

            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err) {
                console.error('Webhook signature verification failed:', err);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            // Handle the payment intent succeeded event
            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                await PaymentService.handleSuccessfulPayment(paymentIntent.id);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('Webhook processing error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Refund payment
    static async refundPayment(req, res) {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const { paymentIntentId, amount } = req.body;
            
            if (!paymentIntentId) {
                return res.status(400).json({ error: 'Payment intent ID is required' });
            }

            const refund = await PaymentService.refundPayment(
                paymentIntentId,
                amount
            );

            res.status(200).json(refund);
        } catch (error) {
            console.error('Refund error:', error);
            res.status(500).json({ 
                error: error.message || 'Refund processing failed' 
            });
        }
    }
}

export default PaymentController;