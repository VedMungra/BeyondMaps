# BeyondMaps - Travel Agency Platform

![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)
![React](https://img.shields.io/badge/react-19+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-Atlas-green.svg)

## Overview

  BeyondMaps is a comprehensive full-stack travel agency platform that enables seamless tour package management, inquiry handling, and immersive travel booking experiences. Built with modern web technologies, it provides a complete end-to-end travel management system with role-based access control, secure content management, and robust customer engagement workflows.

## Key Features

### Authentication & User Management
- **User Registration & Login** - Secure authentication with JWT
- **Role-Based Access Control** - Admin and regular user roles with specific permissions
- **Admin Dashboard** - Complete administrative control over platform content

### Content Management System (CMS)
- **Create Tour Packages** - Admins can create detailed travel itineraries and packages
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

## Application Features in Detail

### User Roles & Permissions

**Traveler (User):**
- Browse tour packages
- View detailed itineraries
- Submit travel inquiries
- Read reviews

**Admin:**
- Complete platform oversight
- Manage tour packages (CRUD operations)
- Review and respond to inquiries
- Manage user access

### Tour Lifecycle
1. **Creation** - Admin creates a tour package with details and images
2. **Active** - Tour is published and visible to travelers
3. **Inquiry** - Interested users submit inquiries
4. **Follow-up** - Admins handle leads and assist with bookings

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **CORS Protection** - Configured cross-origin resource sharing
- **Input Validation** - express-mongo-sanitize for NoSQL injection prevention
- **XSS Protection** - xss-clean to sanitize user input
- **Environment Variables** - Secure configuration management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support & Contact

For support, questions, or contributions, please contact:
- Name: Ved Mungra
- GitHub: [https://github.com/VedMungra](https://github.com/VedMungra)
