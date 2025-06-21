import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerAddress: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    foodItems: [{
        foodId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Food', 
            required: true 
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: { 
            type: Number, 
            required: true, 
            min: 1 
        }
    }],
    totalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    orderStatus: { 
        type: String, 
        enum: ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentType: { 
        type: String, 
        enum: ['cash_on_delivery', 'card'], 
        required: true 
    },
    paymentIntentId: {
        type: String
    },
    deliveryInstructions: {
        type: String,
        trim: true,
        maxlength: 500
    },
    estimatedDeliveryTime: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true
    }
});

// Add indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Virtual for formatted order date
orderSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

const Order = mongoose.model("Order", orderSchema);
export default Order;