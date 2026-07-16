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
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Only set when the inquiry was submitted by a logged-in customer
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

// Speeds up the admin lead-pipeline view, which filters/groups by status
InquirySchema.index({ status: 1 });

module.exports = mongoose.model('Inquiry', InquirySchema);
