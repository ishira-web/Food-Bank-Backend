import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    
    customerName : {type:String,required:true},
    customerAddress : {type:String,required:true},
    customerEmail : {type:String,required:true}
})