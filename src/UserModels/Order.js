import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    
    customerName : {type:String,required:true},
    customerAddress : {type:String,required:true},
    customerEmail : {type:String,required:true},
    foodItems : [{
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalPrice: { type: Number, required: true, min: 0 },
    orderStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } 
});
const Order = mongoose.model("Order", orderSchema);
export default Order;