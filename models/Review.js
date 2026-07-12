const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        required: [true, 'Please add some comments']
    },
    photos: {
        type: [String],
        default: []
    },
    tourPackage: {
        type: mongoose.Schema.ObjectId,
        ref: 'TourPackage',
        required: true
    },
    userName: {
        type: String,
        required: [true, 'Please add a user name']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
