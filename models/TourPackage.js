const mongoose = require('mongoose');

const TourPackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    category: {
        type: String,
        enum: ['Tour Package', 'Group Trip'],
        default: 'Tour Package'
    },
    region: {
        type: String,
        enum: ['Domestic', 'International'],
        default: 'Domestic'
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    duration: {
        type: String,
        required: [true, 'Please add a duration (e.g. 10 Days 9 Nights)']
    },
    itinerary: {
        type: [String],
        required: true
    },
    amenities: {
        type: [String],
        default: []
    },
    inclusions: {
        type: [String],
        default: []
    },
    exclusions: {
        type: [String],
        default: []
    },
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    gallery: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TourPackage', TourPackageSchema);
