# Travel Agency Backend - Development Log

This document serves as a comprehensive log of all the steps we have taken so far to build the backend for the Travel Agency CMS and Lead Generation platform.

## 1. Project Initialization
- **Action:** We initialized a new Node.js project.
- **Details:** We ran `npm init -y` to generate the `package.json` file, which keeps track of all our project's metadata and dependencies.

## 2. Dependency Installation
- **Action:** We installed the necessary tools and libraries.
- **Details:** 
  - **Production Dependencies:** `express` (web framework), `mongoose` (database modeling), `bcryptjs` (password hashing), `jsonwebtoken` (authentication), `cors` (cross-origin resource sharing), `dotenv` (environment variables), and `nodemailer` (sending emails).
  - **Development Dependencies:** `nodemon` (automatically restarts the server when code changes are made).

## 3. Directory Structure Setup (Clean Architecture)
- **Action:** We organized the codebase into a standard, scalable folder structure.
- **Details:** Based on your feedback, we placed the core folders directly in the root directory for easier access:
  - `config/`: Contains database connection logic (`db.js`).
  - `controllers/`: Contains the actual business logic for our APIs (e.g., what happens when you try to create a tour or register a user).
  - `models/`: Defines the structure of our database tables using Mongoose schemas.
  - `routes/`: Maps specific URL endpoints (like `/api/v1/tours`) to the functions in our controllers.
  - `utils/`: Contains helper functions like `jwt.js` (for token generation) and `mailer.js` (for sending emails).

## 4. Database Modeling (Mongoose)
- **Action:** We created the schemas that define how data is stored in MongoDB.
- **Details:**
  - `AdminUser.js`: Stores admin details and hashes their password before saving it to the database.
  - `TourPackage.js`: Stores travel package details (title, price, itinerary, etc.).
  - `Inquiry.js`: Stores customer inquiries/leads and links them to specific `TourPackages` using explicit Object IDs.
  - `Review.js`: Stores customer reviews and ratings, also linked to `TourPackages`.

## 5. API Routing & Controllers
- **Action:** We set up the basic CRUD (Create, Read, Update, Delete) operations.
- **Details:** We created controllers and routes for:
  - **Auth:** Register and login functionality.
  - **Tours:** Getting all tours, getting a single tour, creating, updating, and deleting tours.
  - **Inquiries:** Submitting new leads and updating lead status (Pending, Contacted, Closed).
  - **Reviews:** Adding and reading reviews for tours.

## 6. Core Application Configuration
- **Action:** We tied everything together.
- **Details:**
  - `app.js`: Initializes the Express server, enables CORS, parses JSON requests, and mounts all our routes (`/api/v1/...`).
  - `server.js`: The main entry point. It connects to the database, imports `app.js`, and starts listening on port 5000. It also includes a fail-safe to catch unhandled promise rejections.

## 7. Environment Variables & Database Connection
- **Action:** We secured our configuration and connected to MongoDB Atlas.
- **Details:**
  - We created a `.env` file to store sensitive data like our `MONGO_URI`, `JWT_SECRET`, and port number.
  - We URL-encoded the `@` symbol in your MongoDB password to ensure the connection string parsed correctly.
  - You successfully started the server using `npm run dev`, and it connected to your cloud database!
## 8. Security & Authentication
- **Action:** We implemented Authentication Middleware using JSON Web Tokens (JWT).
- **Details:**
  - Created `middleware/auth.js` to extract and verify the `Bearer` token from request headers.
  - Protected the Tour Routes (`POST`, `PUT`, `DELETE`) so only authenticated Admin Users can modify travel packages.
  - Protected the Inquiry Routes (`GET`, `PUT`) so only Admin Users can view leads or update their status.
  - Left read-only routes (like `GET /api/v1/tours`) and inquiry submission (`POST /api/v1/inquiries`) public for website visitors.

## 9. API Testing & Verification
- **Action:** We wrote and executed an automated test script to verify security.
- **Details:**
  - Successfully registered a new Admin User and generated a JWT token.
  - Verified that accessing protected endpoints (like creating a tour) without a token correctly results in a `401 Unauthorized` error.
  - Verified that passing a valid token successfully authenticates the user and creates the resource in MongoDB.

## 10. Global Error Handling
- **Action:** Refactored the entire application to use centralized error handling.
- **Details:**
  - Created a custom `ErrorResponse` class and an `asyncHandler` wrapper to eliminate repetitive `try/catch` blocks.
  - Built a global error handler middleware (`middleware/error.js`) that automatically intercepts and formats Mongoose errors (Validation, Duplicate Key, Cast) into readable JSON.
  - Refactored all existing controllers to use the new architecture.
  - Wrote and executed an automated test script (`test_error.js`) to verify that Mongoose validation errors correctly trigger the error handler and return a clean JSON response instead of crashing the server.

## 11. Data Validation & Security
- **Action:** Secured the application against common vulnerabilities.
- **Details:**
  - Installed `express-mongo-sanitize` and `helmet` (older packages like `xss-clean` and `hpp` were intentionally excluded due to incompatibility with modern Express).
  - Configured `mongoSanitize` with a custom wrapper to safely strip malicious characters (like `$`) without crashing the server.
  - Configured `helmet` to set 11 standard secure HTTP headers.
  - Mitigated threats like NoSQL Injections.
  - Wrote and executed a test script (`test_security.js`) which proved that NoSQL injection attempts are intercepted by the sanitizer and safely rejected by Mongoose's validation system.

## 12. File Uploads (Tour Photos)
- **Action:** Added functionality to upload images for tour packages.
- **Details:**
  - Installed `multer` to handle `multipart/form-data`.
  - Updated the `TourPackage` model to include a `photo` field with a default value.
  - Created `middleware/upload.js` to enforce image-only uploads (jpeg, jpg, png), limit file size to 5MB, and dynamically rename files based on the Tour ID and timestamp.
  - Built a new protected route `PUT /api/v1/tours/:id/photo` and a dedicated controller to handle the database updates.
  - Configured `app.js` to serve the `public/` directory statically so frontend applications can render the uploaded images via URL.
  - Wrote and executed an automated test script (`test_upload.js`) to verify the end-to-end file upload process, proving the image is securely stored and the MongoDB database is updated with the new filename.

## 13. Advanced Filtering & Pagination
- **Action:** Implemented advanced query parsing for the API.
- **Details:**
  - Created a highly reusable `advancedResults.js` middleware.
  - Enabled **Filtering** using standard operators (e.g., `?price[lte]=500`).
  - Enabled **Selecting** specific fields to save bandwidth (e.g., `?select=title,description`).
  - Enabled **Sorting** by any field, ascending or descending (e.g., `?sort=-price`).
  - Enabled **Pagination** using `page` and `limit` queries to manage large datasets gracefully.
  - Applied this new architecture to the Tour Packages `GET` route.

## 14. Frontend Initialization & Redesign (Avian Experiences Theme)
- **Action:** Scaffolded a React application and implemented a premium light-theme design.
- **Details:**
  - Initialized a blazing-fast React app using Vite in the `frontend/` directory.
  - Configured `vite.config.js` to proxy `/api` requests to the Node.js backend on port 5000.
  - Overhauled the design to mimic the aesthetic of "Avian Experiences": a bright white/off-white layout featuring their signature Coral Orange (`#FF6D3B`), heavy rounded borders (`24px`), pill-shaped buttons, and `Inter` typography.
  - Built the Home Page (`App.jsx`) containing a bold Hero Section, cleanly formatted Tour Cards with routing details and price blocks, and a high-contrast dark footer.
  - Automatically fetches and displays real Tour Packages directly from the MongoDB backend.

## 15. Frontend Routing & Components
- **Action:** Upgraded the React app into a multi-page application.
- **Details:**
  - Installed `react-router-dom` to handle client-side routing.
  - Refactored the monolithic `App.jsx` by extracting reusable `Navbar.jsx` and `Footer.jsx` components.
  - Created a dedicated `Home.jsx` page for the main landing experience.
  - Built a dynamic `TourDetails.jsx` page that uses the URL parameter (e.g., `/tour/:id`) to fetch and display a specific tour's full itinerary, pricing, and cover photo.
  - Wired `App.jsx` to serve as the master layout controller wrapping the Routes.

## 16. Lead Generation Integration (Frontend)
- **Action:** Wired up the frontend to capture customer inquiries and save them to the database.
- **Details:**
  - Added premium form styling (`.form-control`) to `index.css`.
  - Upgraded the `TourDetails.jsx` page to include an interactive lead capture form.
  - Implemented React state to handle user inputs (Name, Email, Phone, Message) and loading states.
  - Built an `onSubmit` handler that successfully `POST`s the data to the `/api/v1/inquiries` backend endpoint, automatically linking the lead to the specific `tourPackage` ID.
  - Added a smooth "Thank You" UI state upon successful submission.

## 17. Admin Dashboard (Frontend)
- **Action:** Built a secure portal for managing the CMS and Leads.
- **Details:**
  - Created `AdminLogin.jsx` to interface with the JWT authentication API and store tokens in browser `localStorage`.
  - Created a protected `AdminDashboard.jsx` featuring a dual-tab layout (Leads vs. Tours).
  - Wired the "Leads" tab to securely fetch from `/api/v1/inquiries` and display data in `.admin-table`.
  - Built a comprehensive "Create Tour" form that handles complex JSON data (itinerary arrays) and sequential `multipart/form-data` uploads for the cover photo.

## 18. Customer Reviews (Frontend)
- **Action:** Added social proof features allowing users to read and write reviews.
- **Details:**
  - Designed premium `.review-card` elements in `index.css` featuring star ratings and custom typography.
  - Upgraded `TourDetails.jsx` to fetch reviews from the `/api/v1/tours/:id/reviews` endpoint.
  - Built an interactive "Write a Review" form that securely `POST`s new reviews to the backend and instantly updates the UI state.

## 19. Customer Phone Number Authentication
- **Action:** Removed Admin Login from the public UI and implemented customer login.
- **Details:**
  - Created `models/User.js` to store customer accounts securely via phone number.
  - Built `userAuthController.js` and mounted `/api/v1/users/login` to simulate seamless OTP token generation.
  - Developed `UserLogin.jsx` on the frontend for customers to authenticate using just their phone number.
  - Updated `Navbar.jsx` to dynamically render "Log In" (routing to `/login`) or "My Account" based on local storage JWT state.

## 20. Destinations Bar UI
- **Action:** Added a global, horizontally scrollable category filter bar.
- **Details:**
  - Built `DestinationsBar.jsx` to render an array of destinations with placeholder emoji icons.
  - Added `.destinations-container` styling to support hidden scrollbars (`scrollbar-width: none`) and modern interactive hover states.
  - Injected the component globally into `App.jsx` immediately following the Navbar.

## 21. Categorized Trips (Home vs Tour Packages vs Group Trips)
- **Action:** Split the platform into three dedicated navigational pages.
- **Details:**
  - **Database:** Added a `category` enum field (`'Tour Package'`, `'Group Trip'`) to the `TourPackage` MongoDB schema.
  - **Admin UI:** Added a Category dropdown to the "Create Tour" form in `AdminDashboard.jsx`, allowing admins to natively tag trips.
  - **Routing:** Created dedicated routes in `App.jsx` for `/tour-packages` and `/group-trips` which pass down a `category` prop to the `Home` component.
  - **Frontend Filter:** Updated `Home.jsx` to dynamically fetch `/api/v1/tours?category=${category}` using the backend's `advancedResults` middleware.
  - **Navigation:** Updated `Navbar.jsx` with dynamic active-state highlighting using React Router's `useLocation`.

## 22. Dynamic Hero Slider
- **Action:** Upgraded the static hero section into an automatic background carousel.
- **Details:**
  - Designed a robust React-native sliding system in `Home.jsx` using `useEffect` intervals (4 seconds).
  - Used standard React state to cycle through a predefined `slides` array containing specific text strings ("Maps for explorers", etc.) and matching background imagery.
  - Implemented sleek crossfade opacity CSS animations for the background images, and a staggered fade-in transform animation for the dynamic typography.

## 23. Home Page Content Sections (Trending, Domestic, International)
- **Action:** Upgraded the Home Page to display trips grouped by dynamically loaded categories.
- **Details:**
  - **Database:** Added `region` (`enum: ['Domestic', 'International']`) and `isTrending` (`Boolean`) to `TourPackage`.
  - **Admin UI:** Added a Region dropdown and a "Mark as Trending" checkbox to the Admin Dashboard's Create Tour form.
  - **Frontend Rendering:** Refactored `Home.jsx` into a modular `TourSection` component. It now automatically filters the global `tours` state into three distinct arrays (`trendingTours`, `domesticTours`, `internationalTours`) and renders them hierarchically below the Hero Slider.

## 24. Admin Tour Management (CRUD)
- **Action:** Upgraded the Admin Dashboard with full Edit and Delete functionality for tours.
- **Details:**
  - Added a third "Manage Tours" tab in `AdminDashboard.jsx`.
  - Displayed a data table mapping the complete list of tours pulled from `GET /api/v1/tours`.
  - Added Edit functionality: Populates the `newTour` form state with existing data and changes the form submission from `POST` to `PUT /api/v1/tours/:id`.
  - Added Delete functionality: Removes the tour via `DELETE /api/v1/tours/:id` with standard browser `window.confirm` protection.

## 25. Advanced Photo Gallery (Masonry Layout)
- **Action:** Upgraded the single-image hero section into a premium 5-image masonry layout.
- **Details:**
  - **Database:** Added `gallery: [String]` to the `TourPackage` schema for multi-image storage.
  - **Backend APIs:** Created `PUT /api/v1/tours/:id/gallery` mapped to a Multer bulk upload controller (`upload.array('files', 5)`).
  - **Admin UI:** Added a native multi-file selector to the `AdminDashboard.jsx` allowing up to 5 bulk image uploads alongside the primary cover photo.
  - **Frontend UI:** Configured `TourDetails.jsx` to dynamically render a CSS-Grid masonry layout exactly matching the requested design if a trip contains 5 gallery photos.

## 26. Dynamic Tour Inclusions, Exclusions & Amenities
- **Action:** Upgraded the Tour Details page and CMS to support highly customizable, dynamic inclusions and amenities for every individual trip.
- **Details:**
  - **Database:** Expanded the `TourPackage` schema to include `amenities` (Array of Strings), `inclusions` (Array of Strings), and `exclusions` (Array of Strings).
  - **Admin UI:** Upgraded the "Create/Edit Tour" form in `AdminDashboard.jsx` to include a master checklist of 12 customizable amenities (Stay, Meals, Volvo Bus, Bike & Fuel, etc.) and multi-line text areas for bespoke Inclusions and Exclusions.
  - **Frontend Rendering:** Upgraded `TourDetails.jsx` to dynamically map selected `amenities` to their respective custom SVG icons (coffee cups, buses, planes, etc.) in the "What's Included" hero box.
  - **Frontend UI:** Added visually distinct, beautifully stacked Inclusions (styled with green checkmarks) and Exclusions (styled with red crosses) cards rendered immediately below the daily itinerary.

## 27. Dynamic Quick Info Section
- **Action:** Upgraded the Tour Details page to include a fully dynamic "Quick Info" modal section (Packing List, Flight Package, Terms, Know Before You Book).
- **Details:**
  - **Database:** Added `packingList`, `flightPackage`, `termsAndConditions`, and `knowBeforeYouBook` array fields to the `TourPackage` model.
  - **Admin UI:** Added 4 new textareas in the Admin Dashboard (right below Inclusions and Exclusions) to allow line-by-line custom data entry for each tour.
  - **Frontend UI:** Built a dynamic Quick Info modal at the bottom of `TourDetails.jsx` that intelligently renders buttons only if data exists for that specific tour. Fixed an associated React crash caused by legacy hardcoded data references.
  - **Admin Bug Fix:** Fixed an issue where the `attractions` array was wiped out when clicking "Edit" on an existing tour.

## 28. Right Sticky Sidebar Improvements
- **Action:** Enhanced the Tour Details right-hand sticky sidebar with contact and quick action cards.
- **Details:**
  - Added a "Private Trips Available" card highlighting group sizes and a "Request a Callback" trigger.
  - Added a "Quick Actions" card featuring side-by-side "Whatsapp" and "Get PDF" buttons.
  - Wrapped all cards (including pricing) into a responsive, cohesive sticky flex container to ensure smooth synchronized scrolling.

## 29. Backend Modernization & Fixes
- **Action:** Resolved Mongoose deprecation warnings and cleaned up aborted AI integrations.
- **Details:**
  - Upgraded all backend `findByIdAndUpdate` calls in `tourController.js` and `inquiryController.js` from `{ new: true }` to `{ returnDocument: 'after' }` to eliminate Mongoose terminal warnings.
  - Cleaned up and resolved a Vite parsing error (invalid Unicode escape sequence) in `AdminDashboard.jsx`.
  - Removed aborted AI/LLM integration (Tavily search, etc.) upon user request to proceed with a manual approach.

## 30. Customer Review Photo Uploads (2x2 Grid)
- **Action:** Upgraded the Customer Review system to accept and display up to 4 user-uploaded photos in a styled masonry grid.
- **Details:**
  - **Backend Schema & API:** Upgraded the `Review.js` model to support a `photos` array. Integrated Multer `upload.array('photos', 4)` directly into the Review POST route, dynamically generating unique filenames and storing uploaded files securely in `/public/uploads`.
  - **Frontend Submission Form:** Transformed the static JSON review form in `TourDetails.jsx` into a dynamic `FormData` submission, complete with a multi-file selector capped at 4 images.
  - **2x2 Masonry Grid UI:** The Customer Reviews feed now dynamically detects attached photos and renders them in a sleek, responsive 2x2 image grid identically matching the Avian Experiences design system.

## Project Status: 🚀 MVP Complete!
The Travel Agency platform is fully functional. It possesses a robust Node.js/MongoDB backend and a premium, responsive React frontend tailored to the Avian Experiences design aesthetic. It includes full CMS management, Lead Generation, Customer Reviews, Phone-based Customer Authentication, and a custom Destinations Bar.
