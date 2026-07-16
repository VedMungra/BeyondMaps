const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Route files
const authRoutes = require('./routes/authRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const tourRoutes = require('./routes/tourRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/error');

const app = express();

// Body parser
app.use(express.json());

// Sanitize data (NoSQL injection prevention) - Custom wrapper to prevent Express getter crash
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    next();
});

// Set security headers
app.use(helmet());

app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', authRoutes); // Admin Auth
app.use('/api/v1/users', userAuthRoutes); // Customer Auth
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/amenities', require('./routes/amenities'));
app.use('/api/v1/locations', require('./routes/locationRoutes'));

// Error Handler Middleware

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

app.use(errorHandler);

module.exports = app;
