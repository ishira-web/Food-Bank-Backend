import mongoose from "mongoose";

const foodSchema = mongoose.Schema({
    foodName :{type:String,required:true},
    image:{type:String,required:true},
    price:{type:Number,required:true},
    description : {type:String,required:true},
    categoryName : {type:mongoose.Schema.Types.ObjectId,ref:"categories",required:true}
})

const Food  = mongoose.model("Food",foodSchema);
export default Food;