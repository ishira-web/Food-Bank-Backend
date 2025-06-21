import Stripe from 'stripe';
import Order from '../UserModels/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
    static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        if (amount < 50) { // Minimum $0.50
            throw new Error('Amount must be at least $0.50');
        }

        return await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });
    }

    static async handleSuccessfulPayment(paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Payment not completed');
        }

        // Update the order status
        const order = await Order.findOneAndUpdate(
            { paymentIntentId },
            { 
                paymentStatus: 'completed',
                orderStatus: 'processing' // Move to next status
            },
            { new: true }
        );

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    static async refundPayment(paymentIntentId, amount = null) {
        const refundParams = { payment_intent: paymentIntentId };
        if (amount) {
            refundParams.amount = Math.round(amount * 100);
        }

        const refund = await stripe.refunds.create(refundParams);

        // Update the order status
        await Order.findOneAndUpdate(
            { paymentIntentId },
            { 
                paymentStatus: 'refunded',
                orderStatus: 'cancelled'
            }
        );

        return refund;
    }
}

export default PaymentService;