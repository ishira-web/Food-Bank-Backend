import UserModel from "../UserModels/User.Model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cloudinary from "../Configs/Cloudinary.js";

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


// Check admin function
export const isAdmin = async(req)=>{
    if(!req?.user){
        return false
    }
    return req.user.role === "admin"
}

// Check user fucntion
export const isCustomer =  async(req)=>{
   if(!req?.user){
    return false
   }
   return req.user.role === "user"
}

// Create Admin
export const createAdmin = async(req,res)=>{
    try {
        if(!isAdmin(req)){
            return res.status(403).json({message:"Please login as a admin to create admin"})
        }
        const {firstName,lastName,email,password,isActive,role,phoneNumber} =  req.body;
        if (!firstName || !lastName || !email || !password || phoneNumber){
            return res.status(403).json({message:"Requested body is missing !"})
        }
        const checkEmail = UserModel.findOne({email});
        if(checkEmail){
            return res.status(401).json({message:"This Email is already entred !"})
        }
        const hashedPassword = bcrypt.hash(password,10);
        const newUser = new UserModel({
            role : "admin",
            email,
            firstName,
            lastName,
            password : hashedPassword,
            phoneNumber,
            isActive : "true",
        });
        const savedUser = await newUser.save();
        return res.status(201).json({message:"Admin created successfully",savedUser})
    } catch (error) {
        console.error("Error creating donor:", error);
        res.status(500).json({ 
        message: "Error creating donor", 
        error: error.message 
    });
    }
}

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, firstName, lastName, gender, phoneNumber } = req.body;

    const updatedFields = { email, firstName, lastName, gender, phoneNumber };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'customer_profile_pictures'});

      updatedFields.profilePicture = {
        public_id: result.public_id,
        url: result.secure_url,
      };
      fs.unlinkSync(req.file.path);
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully!",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error updating user:", error);
    
    // If Cloudinary upload failed but file was created, clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};


export const getLoggedInUser = async (req, res) => {
  try {
    const userId = req.user.id; // userId from decoded JWT
    const user = await UserModel.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
