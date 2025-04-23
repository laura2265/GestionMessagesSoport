import {v2 as cloudinary} from 'cloudinary';
import pkg from 'multer-storage-cloudinary';
import { nameCloud, imageApiKey, imageApiKeySecret } from './config.js';
import multer from 'multer';
const {CloudinaryStorage} = pkg;

cloudinary.config({
    cloud_name: nameCloud,
    api_key: imageApiKey,
    api_secret: imageApiKeySecret,
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'messenger',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    },
});

const upload = multer({storage: storage})

const uploadImage = async(req, res) => {
    try{
        const imageUrl = req.file.path;
        res.status(200).json({
            imageUrl
        })
    }catch(error){
        console.error('Error al subir la imagen')
        res.status(500).json({
            message: 'Error al subir la imagen'
        })
    }
}

export  {uploadImage, upload}