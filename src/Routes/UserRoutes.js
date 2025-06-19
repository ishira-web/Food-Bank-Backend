// --- Updated UserRoutes.js ---
import express from 'express';
import {getLoggedInUser,updateUser,userLogin,userRegistration,} from '../Controllers/UserController.js';
import upload from '../Configs/multer.js';
import { verifyToken } from '../Middleware/verifyToken.js';

export const userRoutes = express.Router();

userRoutes.post('/register', userRegistration);
userRoutes.post('/login/me', userLogin);
userRoutes.put('/:userId', upload.single('profilePicture'), updateUser);
userRoutes.get('/me', verifyToken, getLoggedInUser);
