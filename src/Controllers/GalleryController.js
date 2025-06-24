import Gallery from "../UserModels/Gallery.js";
import cloudinary from "../Configs/Cloudinary.js";
//Create Gallery
export const createGallery = async (req, res) => {
    try {
        const { title } = req.body;
        if (!req.file || !title) {
            return res.status(400).json({ message: "Image and title are required" });
        }

        let result;
        if (req.file.buffer) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            result = await cloudinary.uploader.upload(dataURI, {
                folder: "gallery",
                resource_type: "image"
            });
        } 
        else if (req.file.path) {
            result = await cloudinary.uploader.upload(req.file.path, {
                folder: "gallery",
                resource_type: "image"
            });
        } else {
            return res.status(400).json({ message: "Invalid file format" });
        }

        const newGallery = new Gallery({
            image: result.secure_url,
            title
        });
        const savedGallery = await newGallery.save();
        res.status(201).json({
            message: "Gallery created successfully",
            gallery: savedGallery
        });
    } catch (error) {
        console.error("Error creating gallery:", error);
        if (error.http_code && error.http_code === 400) {
            return res.status(400).json({ 
                message: "File upload failed: " + error.message 
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation error",
                details: error.errors 
            });
        }
       
        res.status(500).json({ 
            message: "Server error while creating gallery",
            error: error.message 
        });  
    }
}


// Get All Galleries
export const getAllGallery = async (req, res) => {
    try {
        const galleries = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Galleries retrieved successfully",
            galleries
        });
    } catch (error) {
        console.error("Error getting galleries:", error);
        res.status(500).json({
            message: "Server error while retrieving galleries",
            error: error.message
        });
    }
}

// Delete Gallery
export const deleteGallery = async (req, res) => {
    try {
        const { id: galleryId } = req.params;  
        if (!galleryId) {
            return res.status(400).json({ message: "Gallery ID is required" });
        }

        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ message: "Gallery not found" });
        }

        // Delete image from Cloudinary
        const publicId = gallery.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`gallery/${publicId}`);

        await Gallery.findByIdAndDelete(galleryId);
        res.status(200).json({
            message: "Gallery deleted successfully"
        });  
    } catch (error) {
        console.error("Error deleting gallery:", error);
        res.status(500).json({
            message: "Server error while deleting gallery",
            error: error.message
        });
    }
}
