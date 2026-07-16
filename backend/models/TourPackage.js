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
    location: {
        type: mongoose.Schema.ObjectId,
        ref: 'Location'
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
    packingList: { type: [String], default: [] },
    flightPackage: { type: [String], default: [] },
    termsAndConditions: { type: [String], default: [] },
    knowBeforeYouBook: { type: [String], default: [] },
    attractions: [{
        name: { type: String },
        description: { type: String },
        image: { type: String }
    }],
    departures: [{
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        price: { type: Number, required: true },
        status: { type: String, enum: ['Available', 'Filling Fast', 'Sold Out'], default: 'Available' }
    }],
    preBookAmount: {
        type: Number,
        default: 0
    },
    // --- GROUP TRIP FIELDS ---
    startingLocations: [{
        name: { type: String },
        duration: { type: String },
        basePrice: { type: Number },
        travelOptions: [{
            name: { type: String },
            priceDiff: { type: Number }
        }],
        itinerary: [{ type: String }],
        departures: [{
            startDate: { type: Date },
            endDate: { type: Date },
            price: { type: Number },
            status: { type: String, enum: ['Available', 'Filling Fast', 'Sold Out'], default: 'Available' }
        }]
    }],
    roomSharing: [{
        name: { type: String },
        priceDiff: { type: Number }
    }],
    // --- TOUR PACKAGE (PRIVATE) FIELDS ---
    packageOptions: [{
        title: { type: String, required: true },
        image: { type: String, default: 'no-photo.jpg' },
        prices: [{
            groupSize: { type: String, required: true },
            originalPrice: { type: Number, required: true },
            discountedPrice: { type: Number, required: true }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Speeds up the common browse/filter queries (Home page category & region filters, trending list)
TourPackageSchema.index({ category: 1, region: 1, isTrending: 1 });

module.exports = mongoose.model('TourPackage', TourPackageSchema);
