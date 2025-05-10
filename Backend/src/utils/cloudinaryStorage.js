
import cloudinary from './cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Optional: cloud folder name
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

export default storage;
