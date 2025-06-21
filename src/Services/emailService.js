import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendOrderConfirmationEmail = async (email, orderId, customerName, totalAmount) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Your Order Confirmation',
            html: `
                <h1>Thank you for your order, ${customerName}!</h1>
                <p>Your order #${orderId} has been received.</p>
                <p>Total amount: $${totalAmount.toFixed(2)}</p>
                <p>We'll notify you when your order is on its way.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

export const sendOrderStatusUpdateEmail = async (email, orderId, status, estimatedDeliveryTime = null) => {
    try {
        let statusMessage = '';
        switch (status) {
            case 'processing':
                statusMessage = 'is being prepared';
                break;
            case 'out_for_delivery':
                statusMessage = 'is on its way to you';
                break;
            case 'delivered':
                statusMessage = 'has been delivered';
                break;
            case 'cancelled':
                statusMessage = 'has been cancelled';
                break;
            default:
                statusMessage = `status has been updated to ${status}`;
        }

        let deliveryTimeMessage = '';
        if (estimatedDeliveryTime) {
            deliveryTimeMessage = `<p>Estimated delivery time: ${new Date(estimatedDeliveryTime).toLocaleString()}</p>`;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Order Update - #${orderId}`,
            html: `
                <h1>Order Update</h1>
                <p>Your order #${orderId} ${statusMessage}.</p>
                ${deliveryTimeMessage}
                <p>Thank you for choosing our service!</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};