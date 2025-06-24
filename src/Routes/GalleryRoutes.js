import express from 'express';
import { createGallery, deleteGallery, getAllGallery } from '../Controllers/GalleryController.js';

const galleryRouter = express.Router();

galleryRouter.post('/upload', createGallery);
galleryRouter.get('/all', getAllGallery);
galleryRouter.delete('/delete/:id',deleteGallery);