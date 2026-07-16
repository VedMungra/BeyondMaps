const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ErrorResponse = require('../utils/errorResponse');
const { cloudinary, isConfigured: cloudinaryConfigured } = require('../config/cloudinary');

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new ErrorResponse('Please upload an image file (jpeg, jpg, png)', 400));
    }
}

// Cloudinary storage when configured (persists across redeploys/multiple instances),
// otherwise fall back to the original local disk storage.
const storage = cloudinaryConfigured
    ? new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'beyondmaps/tours',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            public_id: (req, file) => {
                const idStr = req.params.id || req.params.tourId || 'upload';
                return `photo_${idStr}_${Date.now()}`;
            }
        }
    })
    : multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads');
        },
        filename: function (req, file, cb) {
            const idStr = req.params.id || req.params.tourId || 'upload';
            cb(null, `photo_${idStr}_${Date.now()}${path.extname(file.originalname)}`);
        }
    });

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Lets controllers know whether req.file.path is a Cloudinary URL or a local disk path,
// since the field that should be persisted to the DB differs between the two.
upload.usingCloudinary = cloudinaryConfigured;

module.exports = upload;
