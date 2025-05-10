import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set destination to the "uploads" folder
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        // Create a unique filename using the current timestamp and original file name
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Multer middleware for handling single file upload with the name 'product'
const upload = multer({ storage });

export default upload;






