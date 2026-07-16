const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const { clean: cleanXss } = require('xss-clean/lib/xss');

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

// Trust the first hop reverse proxy (e.g. Render) so req.ip / X-Forwarded-For reflect
// the real client instead of the proxy - required for express-rate-limit to key by
// client IP instead of lumping every user into the proxy's single IP.
app.set('trust proxy', 1);

// Body parser
app.use(express.json());

// Sanitize data (NoSQL injection prevention) - Custom wrapper to prevent Express getter crash
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    next();
});

// Sanitize data (XSS prevention) - xss-clean's own middleware reassigns req.query
// ("req.query = clean(req.query)"), which Express 5 rejects since req.query is a
// getter with no setter. Mutate each object's keys in place instead of reassigning it.
app.use((req, res, next) => {
    if (req.body) req.body = cleanXss(req.body);
    if (req.params) {
        const cleaned = cleanXss(req.params);
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, cleaned);
    }
    if (req.query) {
        const cleaned = cleanXss(req.query);
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, cleaned);
    }
    next();
});

// Prevent HTTP Parameter Pollution (e.g. ?sort=a&sort=b)
app.use(hpp());

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
