const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an amenity name'],
        unique: true,
        trim: true
    },
    iconSvg: {
        type: String,
        required: [true, 'Please add the SVG code for the icon']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Amenity', AmenitySchema);
