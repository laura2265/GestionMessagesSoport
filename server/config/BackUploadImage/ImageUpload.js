import cloudinary from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary'

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chatbot',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

export default (cloudinary, storage);