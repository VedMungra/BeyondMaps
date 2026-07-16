# BeyondMaps - Travel Agency Platform

![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)
![React](https://img.shields.io/badge/react-19+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-Atlas-green.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)

## Overview

  BeyondMaps is a comprehensive full-stack travel agency platform that enables seamless tour package management, inquiry handling, and immersive travel booking experiences. Built with modern web technologies, it provides a complete end-to-end travel management system with role-based access control, secure content management, and robust customer engagement workflows.

## Key Features

### Authentication & User Management
- **Two separate auth systems, matched to two different trust levels:**
  - **Admins** log in with email/password (JWT-based). Registration is gated behind a server-side `ADMIN_REGISTER_KEY` secret, not open to the public.
  - **Customers** log in with just a phone number via Firebase Phone Authentication (OTP) - no password required. The backend verifies the Firebase ID token server-side before issuing its own JWT.
- **Role-Based Access Control** - Admin and customer roles with fully separate, independently-protected route middleware
- **Admin Dashboard** - Complete administrative control over platform content
- **Customer Account Page** (`/account`) - Logged-in customers can view their own submitted inquiries and status

### Content Management System (CMS)
- **Create Tour Packages** - Admins can create detailed travel itineraries and packages
- **Dynamic Content** - Manage modular features like Amenities (with SVG icons) and Locations
- **Image Uploads** - Cloudinary-backed uploads when configured, with automatic fallback to local disk storage otherwise
- **Package Management** - Complete lifecycle management of tour offerings
- **Reviews & Ratings** - Dedicated system for user feedback and ratings

### Customer Engagement
- **Inquiry System** - Users can submit travel inquiries for specific tours, optionally linked to their account if logged in
- **Automated Emails** - Email notifications via Nodemailer, sent on inquiry submission
- **Lead Generation** - Structured handling of prospective traveler data through a `Pending -> Contacted -> Closed` pipeline

### Other Features
- **Advanced Security** - Protection against XSS, NoSQL Injection, and HTTP Parameter Pollution, all verified compatible with Express 5's stricter request object model
- **Rate Limiting** - Throttled login and inquiry-submission endpoints to blunt credential-stuffing and lead-form spam
- **CORS Configuration** - Secure cross-origin resource sharing
- **Responsive UI** - Dynamic and fast React interface

## Architecture

### Backend (Node.js + Express)
```
backend/
├── config/         # Database and environment configurations
├── controllers/    # Business logic handlers (Tours, Reviews, Inquiries, Users)
├── models/         # MongoDB data models
├── routes/         # API route definitions
├── middleware/     # Custom middleware (Auth, Error handling, Uploads)
├── utils/          # Utility functions
└── server.js       # Express server configuration
```

### Frontend (React + Vite)
```
frontend/src/
├── components/     # Reusable UI components
├── pages/          # Page-level components (Home, TourDetails)
├── assets/         # Static assets
└── App.jsx         # Main application routing
```

## Technology Stack

### Backend Technologies
- **Node.js 20+** - JavaScript runtime
- **Express.js 5** - Web framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT Authentication** - Secure token-based authentication (separate schemes for admins and customers)
- **Firebase Admin SDK** - Server-side verification of customer phone/OTP login
- **bcryptjs** - Password hashing
- **Multer + Cloudinary** - File uploading, with local disk fallback if Cloudinary isn't configured
- **Nodemailer** - Email service
- **express-rate-limit** - Login and inquiry-submission throttling
- **Helmet, HPP & XSS-Clean** - Advanced API security
- **express-mongo-sanitize** - NoSQL injection prevention

### Frontend Technologies
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Firebase (client SDK)** - Phone number + OTP authentication for customers

### Development Tools
- **Nodemon** - Development server monitoring
- **Git** - Version control
- **Docker** - Containerization with `docker-compose`

## Application Features in Detail

### User Roles & Permissions

**Traveler (Customer):**
- **Passwordless Login**:
  - Log in with just a phone number - Firebase handles the OTP delivery and anti-bot verification.
  - The backend verifies the Firebase ID token server-side before creating an account and issuing its own JWT.
- **Browse Packages**: 
  - Dynamically explore a wide variety of different tour packages.
  - Filter and search destinations based on specific geographical locations.
  - View real-time availability and categorized trip types.
- **Detailed Itineraries**: 
  - Access comprehensive day-by-day schedules and planned activities.
  - Explore featured local attractions and points of interest.
  - Analyze transparent pricing structures and immersive, high-resolution photo galleries.
- **Inquiry Submission**: 
  - Send customized travel inquiries attached directly to specific tour packages.
  - Provide contact details and custom messages to initiate the booking process.
  - If logged in, the inquiry is automatically linked to the customer's account.
- **My Inquiries**:
  - Logged-in customers can view every inquiry they've submitted and its current status on a dedicated account page.
- **Review System**: 
  - Submit honest ratings and written feedback for completed tours.
  - Read aggregated reviews from previous travelers to make informed decisions.

**Admin:**
- **Platform Oversight**: 
  - Access a secure, JWT-authenticated administrative dashboard.
  - Registration is gated behind a server-side secret key, not open to the public.
  - Oversee all platform metrics, active packages, and pending leads from a centralized hub.
- **Tour Management**: 
  - Complete CRUD (Create, Read, Update, Delete) capabilities for all tour packages.
  - Securely upload, replace, or remove single cover images and full photo galleries via Multer.
  - Write and format rich-text descriptions for daily itineraries.
- **Dynamic Content Control**: 
  - Manage standalone database entities like "Locations" and "Amenities" independently.
  - Link multiple dynamic amenities and locations to tours without touching frontend code.
- **Lead Management**: 
  - Track incoming customer inquiries in real-time.
  - Review customer contact info, respond to leads, and manage the booking pipeline.

### Tour Lifecycle
- **1. Creation**: Admins construct a new tour package, assign appropriate dynamic locations and amenities, and upload visual assets.
- **2. Active Deployment**: The tour is published to the MongoDB database and immediately rendered on the React frontend for travelers.
- **3. Inquiry Generation**: Interested users find the tour and submit inquiries, triggering internal server workflows.
- **4. Follow-up & Conversion**: Admins handle the captured leads via the dashboard, assist with final bookings, and communicate with the travelers.

### Core Systems
- **Automated Email Notifications**: 
  - Integrated with Nodemailer to dispatch transactional emails.
  - Sends immediate confirmations to users upon inquiry submission and alerts admins of new leads.
- **File Management**: Local secure image uploading managed by Multer, supporting both single photos and gallery arrays.

## Security Features

- **JWT Authentication** - Separate token schemes for admins and customers, each with their own route-protection middleware
- **Gated Admin Registration** - Creating an admin account requires a server-side `ADMIN_REGISTER_KEY` secret; the endpoint refuses to work at all if that key isn't configured
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Login endpoints and inquiry submission are throttled per client IP
- **CORS Protection** - Configured cross-origin resource sharing
- **Input Validation** - express-mongo-sanitize for NoSQL injection prevention
- **XSS Protection** - xss-clean to sanitize user input
- **HTTP Parameter Pollution Protection** - hpp guards against duplicate/array query parameters being used to bypass validation
- **Environment Variables** - Secure configuration management, with sensible fallbacks (e.g. local disk storage when Cloudinary isn't configured) rather than hard failures

## Environment Setup

Copy `.env.example` to `.env` in the repo root and fill in:

| Variable | Required? | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRE` | Yes | Signs both admin and customer JWTs |
| `ADMIN_REGISTER_KEY` | Yes | Required to create an admin account via `POST /api/v1/auth/register` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `FROM_EMAIL` / `FROM_NAME` | Yes, for email | Inquiry confirmation emails (works well with [Mailtrap](https://mailtrap.io)'s free Sandbox for local testing) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Optional | Enables cloud-hosted photo uploads; falls back to local disk storage if unset |

Additionally, for customer phone/OTP login:
- Place a Firebase service account key at `backend/firebase-service-account.json` (from Firebase Console -> Project settings -> Service accounts -> Generate new private key).
- Create `frontend/.env` with `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` (from the same Firebase project's Web app config).
- Enable the **Phone** sign-in provider in Firebase Console -> Authentication -> Sign-in method, and make sure `localhost` (dev) and your real domain (production) are listed under Authorized domains.

## 🐳 Running with Docker

You can easily run the backend environment using Docker Compose:

1. Clone the repository
2. Ensure you have your `.env` file set up in the root directory
3. Run the following command:
   ```bash
   docker-compose up --build -d
   ```
This will containerize the Node.js API and expose it on port `5000`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
