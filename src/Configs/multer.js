import multer from "multer";
import path from 'path'

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb) =>{
    const ext =  path.extname(file.originalname).toLowerCase();
    if(ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp"){
        cb(null,true);
    }else{
        cb(new Error("Only image files are allowed"),false);
    }
};

const upload = multer({storage,fileFilter});
export default upload;