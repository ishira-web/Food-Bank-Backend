import express from 'express'
import dotnev from 'dotenv'
import Jwt from 'jsonwebtoken'
import cors from 'cors'
import { connectDB } from './DB/MongoDB.js';

const app =  express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotnev.config()

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



const port = process.env.PORT


app.listen(port,()=>{
    connectDB();
    console.log(`Server is running on port http://localhost:${port}`)
});