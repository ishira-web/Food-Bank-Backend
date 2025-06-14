import UserModel from "../UserModels/User.Model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// User Registration

export const userRegistration = async(req,res)=>{
    try {
        const {firstName,lastName,email,password,profilePictrue,gender,role,isActive,phoneNumber}=req.body;
        if(!email || !password || !firstName || !lastName || !phoneNumber){
            return res.status(403).json({message : 'Requried fields are missing'})
        }
        const existingUser = await UserModel.findOne({email});
        if(existingUser){
            return res.status(403).json({message : "This email already entered to the database"});
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const newUser =  new UserModel({
            role,
            firstName,
            lastName,
            email,
            password : hashedPassword,
            profilePictrue,
            isActive,
            phoneNumber,
            gender
        });
        const savedUser = await newUser.save();
        const payload = { id: savedUser._id, role: savedUser.role, email: savedUser.email };
        const token = jwt.sign(payload,process.env.SECRET_KEY, {expiresIn: '7d'});
        return res.status(201).json({
         message : "user created successfully !",
         result :{savedUser},
         token
        });
    } catch (error) {
         console.error("Error creating donor:", error);
         res.status(500).json({ 
         message: "Error creating donor", 
         error: error.message 
        });
    }
}



// User Login

export const userLogin = async (req,res)=>{
   try {
     const {email , password} =  req.body;
     if(!email || !password){
        return res.status(403).json({message : 'Email ad password requried !'})
     }
     const user = await UserModel.findOne({email});
     if(!user){
        return res.status(403).json({message : 'Invalid credentials'})
     }
     const checkPassword = bcrypt.compare(password, user.password);
     if(!checkPassword){
        return res.status(403).json({message : 'Password didnt match!'})
     }
     if(user.isActive === false){
         return res.status(403).json({ message: 'Account is inactive' });
     }
     const payload = { id: user._id, role: user.role, email: user.email };
     const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
     return res.status(201).json({
        message : "Login successfully",
        token
     });
   } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user", error: error.message });
   }
}


// create admin
