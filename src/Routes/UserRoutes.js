import express from 'express';
import { userRegistration } from '../Controllers/UserController.js';

export const userRoutes = express.Router();

userRoutes.post('/register', userRegistration);