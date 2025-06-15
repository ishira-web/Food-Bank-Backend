import express from 'express';
import { updateUser, userLogin, userRegistration } from '../Controllers/UserController.js';

export const userRoutes = express.Router();

userRoutes.post('/register', userRegistration);
userRoutes.post('/login/me',userLogin);
userRoutes.put('/',updateUser);