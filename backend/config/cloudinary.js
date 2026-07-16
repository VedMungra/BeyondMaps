const cloudinary = require('cloudinary').v2;

const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// Mirrors the conditional-init pattern already used for Firebase Admin (config/firebase.js) -
// uploads fall back to local disk storage (middleware/upload.js) when these aren't set,
// rather than crashing the server over a missing optional integration.
if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary configured - tour photo uploads will be stored in the cloud.');
} else {
    console.log('WARNING: CLOUDINARY_* env vars not set. Falling back to local disk storage for uploads.');
}

module.exports = { cloudinary, isConfigured };
