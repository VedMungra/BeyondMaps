// Uploaded tour images may be a bare local filename served from /uploads/ (Multer disk
// storage) or a full Cloudinary URL (when CLOUDINARY_* env vars are configured on the
// backend) - this normalizes either into a usable <img src>.
export function resolveImageUrl(value) {
    if (!value) return null;
    return value.startsWith('http') ? value : `/uploads/${value}`;
}
