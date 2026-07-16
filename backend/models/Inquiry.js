const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    tourPackage: {
        type: mongoose.Schema.ObjectId,
        ref: 'TourPackage',
        required: false // Optional, can be a general inquiry
    },
    status: {
        type: String,
        enum: ['Pending', 'Contacted', 'Closed'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
