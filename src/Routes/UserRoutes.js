import express from 'express';
import { userLogin, userRegistration } from '../Controllers/UserController.js';

export const userRoutes = express.Router();

userRoutes.post('/register', userRegistration);
userRoutes.post('/login/me',userLogin);