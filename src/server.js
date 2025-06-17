import express from 'express'
import dotnev from 'dotenv'
import cors from 'cors'
import { connectDB } from './DB/MongoDB.js';
import { userRoutes } from './Routes/UserRoutes.js';
import categoryRoutes from './Routes/CategoryRoutes.js';
import jwt from 'jsonwebtoken'
dotnev.config()
const app =  express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  (req,res,next)=>{

  const token =  (req.header("Authorization"))?.replace("Bearer ", "")

  if(token != null){
    jwt.verify(token, process.env.SECRET_KEY, (error, decoded)=>{
      if(!error){
        req.user = decoded
      }
    })
  }
  next();
  }
);

// Routes
app.use('/api/account',userRoutes);
app.use('/api/category',categoryRoutes)




const port = process.env.PORT
app.listen(port,()=>{
    connectDB();
    console.log(`Server is running on port http://localhost:${port}`)
});