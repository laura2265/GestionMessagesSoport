import {v2 as cloudinary} from 'cloudinary';
import pkg from 'multer-storage-cloudinary';
import { nameCloud, imageApiKey, imageApiKeySecret } from './config.js';
const {CloudinaryStorage} = pkg;

cloudinary.config({
    cloud_name: nameCloud,
    api_key: imageApiKey,
    api_secret: imageApiKeySecret
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chatbot',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
})

export {cloudinary, storage};