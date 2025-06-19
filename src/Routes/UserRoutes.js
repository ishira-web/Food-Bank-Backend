import express from 'express';
import { getUserbyUserId, updateUser, userLogin, userRegistration } from '../Controllers/UserController.js';
import upload from '../Configs/multer.js'

export const userRoutes = express.Router();

userRoutes.post('/register', userRegistration);
userRoutes.post('/login/me',userLogin);
userRoutes.put('/:userId',upload.single('profilePicture'), updateUser);
userRoutes.get('/:userId',getUserbyUserId);