import express from 'express';
import { createGallery, deleteGallery, getAllGallery } from '../Controllers/GalleryController.js';
import upload from '../Configs/multer.js';
const galleryRouter = express.Router();

galleryRouter.post('/upload',upload.single('image'), createGallery);
galleryRouter.get('/all', getAllGallery);
galleryRouter.delete('/delete/:id',deleteGallery);

export default galleryRouter;