import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName:{
         type : String,
         required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type : String,
        required : true,
    },
    profilePicture:{
        type : String,
    },
    isActive : {
        type : Boolean,
        default : "true"
    },
    gender : {
        type : String,
    },
    role : {
        type :String,
        enum : ["admin" , "user"],
        required : true,
        default : "user"
    },
    phoneNumber : {
        type : Number,
        match : [/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/ , 'PLease enter valide number'],
        required : true
    }
});

const UserModel = mongoose.model('Users',userSchema);
export default UserModel;