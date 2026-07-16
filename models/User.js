const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid phone number']
    },
    role: {
        type: String,
        default: 'user'
    },
    otp: {
        type: String
    },
    otpExpire: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', UserSchema);
