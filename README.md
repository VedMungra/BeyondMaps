# BeyondMaps - Travel Agency Platform

![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)
![React](https://img.shields.io/badge/react-19+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-Atlas-green.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)

## Overview

  BeyondMaps is a comprehensive full-stack travel agency platform that enables seamless tour package management, inquiry handling, and immersive travel booking experiences. Built with modern web technologies, it provides a complete end-to-end travel management system with role-based access control, secure content management, and robust customer engagement workflows.

## Key Features

### Authentication & User Management
- **User Registration & Login** - Secure authentication with JWT
- **Role-Based Access Control** - Admin and regular user roles with specific permissions
- **Admin Dashboard** - Complete administrative control over platform content

### Content Management System (CMS)
- **Create Tour Packages** - Admins can create detailed travel itineraries and packages
- **Dynamic Content** - Manage modular features like Amenities (with SVG icons) and Locations
- **Image Uploads** - Seamless local image uploading using Multer
- **Package Management** - Complete lifecycle management of tour offerings
- **Reviews & Ratings** - Dedicated system for user feedback and ratings

### Customer Engagement
- **Inquiry System** - Users can submit travel inquiries for specific tours
- **Automated Emails** - Email notifications via Nodemailer
- **Lead Generation** - Structured handling of prospective traveler data

### Other Features
- **Advanced Security** - Built-in protection against XSS, NoSQL Injection, and HTTP Parameter Pollution
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
- **JWT Authentication** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploading
- **Nodemailer** - Email service
- **Helmet & XSS-Clean** - Advanced API security

### Frontend Technologies
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing

### Development Tools
- **Nodemon** - Development server monitoring
- **Git** - Version control
- **Docker** - Containerization with `docker-compose`

## Application Features in Detail

### User Roles & Permissions

**Traveler (Customer):**
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
- **Review System**: 
  - Submit honest ratings and written feedback for completed tours.
  - Read aggregated reviews from previous travelers to make informed decisions.

**Admin:**
- **Platform Oversight**: 
  - Access a secure, JWT-authenticated administrative dashboard.
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

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **CORS Protection** - Configured cross-origin resource sharing
- **Input Validation** - express-mongo-sanitize for NoSQL injection prevention
- **XSS Protection** - xss-clean to sanitize user input
- **Environment Variables** - Secure configuration management

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
