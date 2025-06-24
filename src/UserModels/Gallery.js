import mongoose from "mongoose";

const gallerySchema = mongoose.Schema({
    image : { type: String, required: true },
    title : { type: String, required: true },
});

const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;