import UserModel from "../UserModels/User.Model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// User Registration

export const userRegistration = async(req,res)=>{
    try {
        const {firstName,lastName,email,password,profilePictrue,gender,role,isActive}=req.body;
        if(!email || !password || !firstName || !lastName ||)
    } catch (error) {
        
    }
}