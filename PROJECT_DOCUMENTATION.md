# Beyond Maps - Travel Agency Platform - Complete Technical Documentation

**Generated:** July 16, 2026 (updated same day after a hardening pass, then again after live end-to-end verification in the developer's own environment)
**Stack:** MERN (MongoDB, Express 5, React 19, Node.js)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack - Why Questions](#technology-stack---why-questions)
4. [Backend Structure](#backend-structure)
5. [Frontend Structure](#frontend-structure)
6. [Authentication - Complete Explanation](#authentication---complete-explanation)
7. [Security Features](#security-features)
8. [Database Design](#database-design)
9. [Remaining Gaps](#remaining-gaps)
10. [Bugs Found & Fixed During Live Verification](#bugs-found--fixed-during-live-verification)
11. [Interview Questions & Answers](#interview-questions--answers)
12. [Potential Improvements](#potential-improvements)

---

## 🎯 Project Overview

**Beyond Maps** is a travel agency CMS and lead-generation platform. It is not an online booking engine — there's no cart, checkout, or payment gateway. Instead it's built around **showcasing tour packages and capturing leads**: customers browse packages, submit inquiries or reviews, and admins manage the catalog and follow up on leads.

It serves two user groups: **customers** (browsing, phone-auth login, inquiries, reviews, and now a "My Inquiries" account view) and **admins** (catalog management, lead pipeline).

### Key Features

**For Customers:**
- Browse tour packages, filterable by category (`Tour Package` vs `Group Trip`) and region (`Domestic` vs `International`)
- View full itinerary, inclusions/exclusions, packing list, package options, and departures per tour
- Log in via phone number + OTP (Firebase Phone Auth) — no password
- Submit an inquiry (general or tied to a specific tour) — this is the lead-capture mechanism, and receives an automatic confirmation email
- Submit a review with a star rating, comment, and photos for a tour
- View their own submitted inquiries and status (`/account`) once logged in

**For Admins:**
- Email/password login (JWT-based), registration gated by a server-side secret key
- CRUD tour packages, including nested package options, departures, and group-trip starting locations
- Upload a cover photo, a gallery (up to 5 images), and per-package-option photos — to Cloudinary if configured, local disk otherwise
- Manage Locations and Amenities as reusable, referenceable entities
- View and update inquiry status through a lead pipeline: `Pending → Contacted → Closed`
- View all registered (phone-authenticated) users

### Core Metrics
- **Collections:** 7 (AdminUser, User, TourPackage, Location, Amenity, Inquiry, Review)
- **API Endpoints:** ~21 across 7 route files, all under `/api/v1`
- **React Routes:** 8 (`frontend/src/App.jsx`)
- **Authentication:** Two separate schemes — JWT for admins (registration gated by `ADMIN_REGISTER_KEY`), Firebase Phone OTP + app-issued JWT for customers
- **File uploads:** Multer, 5MB limit, jpeg/jpg/png only, Cloudinary storage when configured, local disk fallback otherwise
- **Rate limiting:** Login endpoints (10/15min) and inquiry submission (5/hour), keyed by client IP behind the trusted first proxy hop

---

## 🏗️ System Architecture

### Architectural Decisions

**Decoupled Frontend/Backend (not monolithic):**
- `backend/` — Express 5 API server (`backend/app.js`, `backend/server.js`)
- `frontend/` — React 19 + Vite SPA, calls the API over `/api/v1/*`
- Containerized independently via `docker-compose.yml` + `backend/Dockerfile`
- This is documented in [docs/adr-001-initial-architecture.md](docs/adr-001-initial-architecture.md), which frames the project as a "production-grade Travel Agency CMS and Lead Generation platform" with "clean-architecture" layering: Controllers → Models (Mongoose, ObjectId references) → Routes, plus a "fail-fast" DB connection in `backend/config/db.js`.

**Stale leftover directories removed:** `client/` and `server/` used to exist at the repo root alongside `frontend/` and `backend/` — leftovers from an earlier scaffold containing only `node_modules`/build output and a stray, gitignored `firebase-service-account.json`. Confirmed nothing (`docker-compose.yml`, `app.js`, `frontend/`) referenced them, so both were deleted; the tracked `client/dist/*` bundle was removed from git as well.

**Key Technical Choices:**

#### 1. JWT for admins, Firebase Phone Auth for customers (not one unified scheme)
**Why?**
- Admins are a small, trusted internal group — email/password + JWT is simple and sufficient (`backend/controllers/authController.js`)
- Customers are the general public — asking them to create a password is friction; a phone number they already have is the natural identity for a travel lead ("we need to call you back")
- Firebase handles the actual SMS/OTP delivery and anti-abuse (reCAPTCHA); the backend only verifies the resulting ID token (`backend/config/firebase.js`, `backend/controllers/userAuthController.js:9-49`) rather than building an OTP/SMS pipeline itself

#### 2. Inquiries as the core business object, not bookings
**Why?**
- Travel packages of this kind (multi-day tours, group trips) are typically sold via a phone/WhatsApp follow-up, not self-serve checkout
- The `Inquiry` model (`backend/models/Inquiry.js`) captures exactly what a sales team needs: name, email, phone, message, optional tour reference, an optional link back to the logged-in customer who submitted it, and a status for pipeline tracking
- This avoids the complexity (and liability) of handling payments directly on the platform

#### 3. Express 5 with custom in-place sanitization wrappers
**Why?**
- `express-mongo-sanitize` and `xss-clean`'s own middleware both reassign `req.query` (e.g. `req.query = sanitize(req.query)`), but Express 5 made `req.query` a getter-only property with no setter, so a direct reassignment throws. `backend/app.js` works around both by mutating each object's keys in place (via the sanitize library's internal function for mongo-sanitize, and via `Object.assign`/`delete` after calling `xss-clean`'s internal `clean()` for XSS) instead of calling either package's packaged middleware directly — a concrete example of two libraries lagging a framework's breaking change, patched rather than downgrading Express
- `hpp`, by contrast, mutates `req.query`'s properties in place internally and works unmodified

#### 4. Single flat `TourPackage` model for two different product types
**Why?**
- `Tour Package` (private, per-person pricing via `packageOptions`) and `Group Trip` (shared departures via `startingLocations`) are different products, but the schema keeps both sets of fields on one model (`backend/models/TourPackage.js`) with a `category` discriminator field instead of splitting into two collections or using Mongoose discriminators
- Simpler queries (one collection, one `advancedResults` filter pipeline) at the cost of a schema with two sets of mutually-exclusive optional fields
- Now indexed on `{ category, region, isTrending }` since these are exactly the fields the Home page filters/browses by

#### 5. Cloudinary with a local-disk fallback, not a hard dependency
**Why?**
- Object storage is the right answer once the app is deployed with more than one instance or on ephemeral containers (local disk uploads don't survive a redeploy)
- But requiring Cloudinary credentials to even run the app locally would raise the bar for local development for no benefit — so `backend/config/cloudinary.js` follows the same conditional-init pattern already used for Firebase Admin: if `CLOUDINARY_*` env vars aren't set, uploads silently fall back to the original local disk storage instead of crashing

---

## 💻 Technology Stack - Why Questions

### Backend

#### Why Express 5?
- Latest major version at project start; router and middleware API is stable and well documented
- Trade-off paid: the breaking change to `req.query` (see above) required a workaround for both `express-mongo-sanitize` and `xss-clean`

#### Why MongoDB / Mongoose?
1. **Nested, variable-shape data:** a tour's itinerary, inclusions, package options, and group-trip starting locations are naturally arrays of subdocuments of differing shape between "Tour Package" and "Group Trip" — awkward to normalize into rigid SQL tables
2. **ObjectId references where it matters:** `TourPackage.location` references `Location`, `Inquiry.tourPackage`/`Review.tourPackage` reference `TourPackage`, and `Inquiry.user` references `User` (`backend/models/TourPackage.js`, `backend/models/Inquiry.js`) — relational integrity is used exactly where two entities are genuinely separate, while itinerary/inclusions/departures stay embedded since they only ever belong to one tour

#### Why a generic `advancedResults` middleware instead of per-route filtering?
- `backend/middleware/advancedResults.js` turns any `model.find()` into filterable/sortable/paginated results by parsing query params (`gt`, `gte`, `lt`, `lte`, `in` operators, `select`, `sort`, `page`, `limit`) once, generically — currently wired into `GET /api/v1/tours` (`backend/routes/tourRoutes.js`) so tour search/browse gets filtering and pagination for free without bespoke query-building code in the controller

#### Why Multer with Cloudinary storage (falling back to disk)?
- `backend/middleware/upload.js` picks a `CloudinaryStorage` engine when `CLOUDINARY_*` env vars are present, otherwise the original `multer.diskStorage` — so the same upload code path works whether or not cloud storage is configured
- `backend/controllers/tourController.js` exports a small `fileRef(file)` helper that reads `file.path` (the Cloudinary URL) when Cloudinary is active, or `file.filename` (the bare local filename) otherwise — this is because Cloudinary's storage engine and local disk storage populate different Multer fields with different semantics
- The frontend mirrors this with `frontend/src/utils/resolveImageUrl.js`, which renders a value as-is if it's already a full URL (`http...`), or prefixes it with `/uploads/` if it's a bare local filename

#### Why `helmet`, `hpp`, `xss-clean`, `express-mongo-sanitize`?
- Standard Express hardening: security headers, HTTP parameter pollution protection, XSS sanitization, NoSQL injection sanitization
- All four are now actually mounted in `backend/app.js` (previously `hpp`/`xss-clean` were installed but unused) — see [Security Features](#security-features) for the Express-5-compatibility details on the sanitize/xss wrappers

### Frontend

#### Why React 19 + Vite (not Next.js/CRA)?
- Pure SPA with client-side routing (`react-router-dom` v7) — no need for SSR/SSG since content is read from the API at runtime and there's no public SEO-critical blog/marketing-page requirement documented
- Vite gives fast dev-server startup/HMR; `oxlint` is used for linting instead of ESLint (faster, Rust-based)

#### Why Firebase (client SDK) for phone auth?
- `frontend/src/pages/UserLogin.jsx` uses `RecaptchaVerifier` + `signInWithPhoneNumber` — Firebase handles the invisible reCAPTCHA challenge and SMS delivery entirely client-side; the app only needs to send the resulting ID token to its own backend once to get an app-native JWT back

---

## 📂 Backend Structure

### Models (MongoDB Schemas)

#### 1. `AdminUser.js` — Internal Admin Accounts
```javascript
{
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },  // bcrypt-hashed, hidden by default
    createdAt: Date
}
```
- Password hashed via a `pre('save')` hook using bcrypt
- `matchPassword()` instance method compares a plaintext attempt against the hash

#### 2. `User.js` — Phone-Authenticated Customers
```javascript
{
    phone: { type: String, unique: true, match: /^\+?[1-9]\d{1,14}$/ },
    role: { type: String, default: 'user' },
    otp: String,       // present in schema but unused — Firebase handles OTP, not this app
    otpExpire: Date,   // same
    createdAt: Date
}
```
- `getSignedJwtToken()` signs `{ id, role }` with `JWT_SECRET`/`JWT_EXPIRE` — this is the app's own JWT, separate from the Firebase ID token used only during the login exchange

#### 3. `TourPackage.js` — The Core Catalog Entity
- Shared fields: `title`, `description`, `location` (ref), `category` (`Tour Package`/`Group Trip`), `region` (`Domestic`/`International`), `isTrending`, `price`, `duration`, `itinerary`, `amenities`, `inclusions`/`exclusions`, `photo`, `gallery`, `packingList`, `flightPackage`, `termsAndConditions`, `knowBeforeYouBook`, `attractions[]`, `departures[]`, `preBookAmount`
- Group-Trip-only: `startingLocations[]` (each with its own `basePrice`, `travelOptions[]`, `itinerary[]`, `departures[]`) and `roomSharing[]`
- Tour-Package-only: `packageOptions[]` (each with a `title`, `image`, and tiered `prices[]` by `groupSize` with `originalPrice`/`discountedPrice`)
- Indexed on `{ category: 1, region: 1, isTrending: 1 }` for the Home page's browse/filter queries
- See [backend/models/TourPackage.js](backend/models/TourPackage.js) for the full schema

#### 4. `Inquiry.js` — Lead Capture
```javascript
{
    name: String, email: String, phone: String, message: String,
    tourPackage: { type: ObjectId, ref: 'TourPackage', required: false },
    user: { type: ObjectId, ref: 'User', required: false },
    status: { type: String, enum: ['Pending', 'Contacted', 'Closed'], default: 'Pending' },
    createdAt: Date
}
```
- `tourPackage` is optional — supports both tour-specific and general "contact us" inquiries
- `user` is set server-side only (never trusted from the request body — see [Security Features](#security-features)) when the submitter is a logged-in customer, powering their `/account` "My Inquiries" view
- Indexed on `{ status: 1 }` for the admin lead-pipeline view

#### 5. `Review.js` — Customer Feedback
```javascript
{
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    photos: [String],
    tourPackage: { type: ObjectId, ref: 'TourPackage', required: true },
    userName: String,
    createdAt: Date
}
```
- Nested under tours via `router.use('/:tourId/reviews', reviewRouter)` (`backend/routes/tourRoutes.js`)

#### 6/7. `Location.js`, `Amenity.js` — Reference Data
- Simple reusable entities referenced by `TourPackage.location` and free-text `amenities` list; managed by admins via their own CRUD routes

### Routes (all mounted under `/api/v1` in `backend/app.js`)

| Mount | File | Purpose |
|---|---|---|
| `/auth` | `authRoutes.js` | Admin register (key-gated) / login (rate-limited) |
| `/users` | `userAuthRoutes.js` | Customer Firebase-token login (rate-limited), admin-only user list |
| `/tours` | `tourRoutes.js` | Tour CRUD, search/filter, photo/gallery/package-option uploads; nests `/tours/:tourId/reviews` |
| `/inquiries` | `inquiryRoutes.js` | Create (public, rate-limited, optionally linked to a logged-in customer), `GET /mine` (customer), list/update (admin) |
| `/reviews` | `reviewRoutes.js` | Review CRUD |
| `/amenities` | `amenities.js` | Amenity CRUD |
| `/locations` | `locationRoutes.js` | Location CRUD |

### Middleware

```javascript
// Admin-only route protection — backend/middleware/auth.js
exports.protect = async (req, res, next) => { /* verifies admin JWT, loads req.user = AdminUser */ };

// Customer-only route protection (added for the "My Inquiries" feature)
exports.protectUser = async (req, res, next) => { /* verifies customer JWT, loads req.customer = User */ };

// Optional customer identification on public routes - never blocks the request
exports.attachCustomerIfPresent = async (req, res, next) => { /* sets req.customer if a valid Bearer token is present */ };
```
- `protect` guards all mutating tour/inquiry/amenity/location routes (`GET` is public)
- `protectUser` guards `GET /api/v1/inquiries/mine`
- `attachCustomerIfPresent` sits in front of `POST /api/v1/inquiries` so a logged-in customer's inquiry gets linked to their account, while anonymous visitors can still submit one
- Admin and customer JWTs share the same `JWT_SECRET` (a pre-existing decision) but decode into different collections (`AdminUser` vs `User`), so a token minted for one role simply fails to resolve — and is rejected — against the other role's middleware

### Rate Limiting

`backend/middleware/rateLimit.js` exports two limiters built on `express-rate-limit`:
- `loginLimiter` — 10 requests / 15 minutes, applied to both `POST /api/v1/auth/login` (admin) and `POST /api/v1/users/login` (customer)
- `inquiryLimiter` — 5 requests / hour, applied to `POST /api/v1/inquiries`

Both key by `req.ip`. Since the app is deployed behind a reverse proxy (Render), `app.set('trust proxy', 1)` is set in `backend/app.js` so Express reads the real client IP from `X-Forwarded-For` instead of keying every visitor to the proxy's single IP (which would have made the rate limit apply globally instead of per-visitor).

### Error Handling

`backend/middleware/error.js` is a centralized handler mapped after all routes that normalizes Mongoose `CastError` → 404, duplicate-key `11000` → 400, and `ValidationError` → 400 with field messages, plus a catch-all 404 for unmatched routes.

---

## 🎨 Frontend Structure

### Routes/Pages (`frontend/src/App.jsx`)

#### 1. Home (`/`, `/tour-packages`, `/group-trips`)
`frontend/src/pages/Home.jsx` — same component reused for all three routes, taking an optional `category` prop (`"Tour Package"` / `"Group Trip"`) to filter the listing; uses `DestinationsBar.jsx` for location filtering.

#### 2. Tour Details (`/tour/:id`)
`frontend/src/pages/TourDetails.jsx` — fetches the tour, its reviews, and amenities on mount. Renders the full itinerary, inclusions/exclusions, package options/departures, and hosts two forms: the inquiry submission form (public lead capture, now attaching the customer's JWT if logged in) and the review submission form (rating + comment + photo upload).

#### 3. Customer Login (`/login`)
`frontend/src/pages/UserLogin.jsx` — two-step phone + OTP flow (see [Authentication](#authentication---complete-explanation) below).

#### 4. Account / My Inquiries (`/account`)
`frontend/src/pages/Account.jsx` — new page. Redirects to `/login` if no `userToken` is present; otherwise fetches `GET /api/v1/inquiries/mine` and lists the customer's own inquiries with status and the linked tour (if any). This is the page the Navbar's profile icon already linked to (`isLoggedIn ? "/account" : "/login"`) before the route existed.

#### 5. Admin Login (`/admin/login`)
`frontend/src/pages/AdminLogin.jsx` — plain email/password form posting to `POST /api/v1/auth/login`, stores the returned JWT as `adminToken` in `localStorage`.

#### 6. Admin Dashboard (`/admin/dashboard`)
`frontend/src/pages/AdminDashboard.jsx` (~1,100 lines) — tabbed interface: Leads (inquiries with status updates), Tour Management (CRUD + cover/gallery/package-option photo upload), Locations, Amenities, Users (read-only list of phone-registered customers).

### Notable Frontend Patterns
- No client-side router guard was found gating `/admin/dashboard` behind a token check at the route level — access control currently depends on the dashboard's own API calls failing with 401 if `adminToken` is missing/invalid, rather than a `<ProtectedRoute>` wrapper redirecting unauthenticated visitors before the page renders. `/account` (customer-facing) does have its own redirect-if-logged-out check.
- Customer login state is broadcast via a custom `window.dispatchEvent(new Event('userLoginStateChanged'))` rather than React context — components that care about login state (e.g. `Navbar`, `Account`'s logout) must dispatch/listen for this window event.
- `frontend/src/utils/resolveImageUrl.js` centralizes the "is this a bare local filename or a full Cloudinary URL" check that was previously duplicated ad hoc (`Home.jsx` had it inline; `TourDetails.jsx` didn't have it at all, which would have broken once Cloudinary URLs started appearing in `tour.photo`).

---

## 🔐 Authentication - Complete Explanation

### Two Independent Auth Systems

This app deliberately does **not** share one auth system between admins and customers — they have different trust levels and different natural identities (email+password vs. phone number).

### 1. Admin Auth (JWT, email/password, key-gated registration)

**Flow:**
```
1. Admin submits email + password → POST /api/v1/auth/login (rate-limited: 10/15min)
2. authController.login:
   - AdminUser.findOne({ email }).select('+password')  // password excluded by default in schema
   - user.matchPassword(password) → bcrypt.compare
   - generateToken(user._id) → signs a JWT
3. Frontend stores token in localStorage as "adminToken"
4. Every admin-only request sends Authorization: Bearer <token>
5. backend/middleware/auth.js verifies it and attaches req.user
```
**Registration** (`POST /api/v1/auth/register`) now requires a `registrationKey` in the request body matching `process.env.ADMIN_REGISTER_KEY`. If that env var isn't set at all, registration is refused outright (fail closed) rather than silently staying open. This closes the previously-public registration endpoint without introducing an existing-admin-token requirement, which would have made bootstrapping the very first admin a chicken-and-egg problem.

### 2. Customer Auth (Firebase Phone OTP → app JWT)

**Flow:**
```
1. Customer enters 10-digit mobile number (frontend prepends +91)
2. Firebase RecaptchaVerifier (invisible) solves an anti-bot challenge client-side
3. signInWithPhoneNumber(auth, phoneNumber, appVerifier) → Firebase sends the actual SMS OTP
4. Customer enters the 6-digit OTP
5. confirmationResult.confirm(otp) → Firebase verifies OTP, returns a Firebase user + ID token
6. Frontend POSTs { idToken } to POST /api/v1/users/login (rate-limited: 10/15min)
7. Backend (userAuthController.js):
   - admin.auth().verifyIdToken(idToken)  — verifies the token server-side against Firebase
   - Extracts decodedToken.phone_number
   - User.findOne({ phone }) or User.create({ phone }) — find-or-create
   - user.getSignedJwtToken() — issues the APP's OWN jwt (separate from Firebase's)
8. Frontend stores this app JWT as "userToken" in localStorage
```

**Why verify server-side at all, if Firebase already verified the OTP?**
The frontend could lie about which phone number "succeeded." Sending the raw ID token and re-verifying it with the Firebase Admin SDK cryptographically proves to the backend which phone number Firebase actually authenticated, before trusting it enough to create a `User` record and issue an app-level JWT.

**Firebase Admin initialization is conditional:** if the service account file is missing, `admin.auth()` returns `null` and `userAuthController.js` responds with a 500 rather than crashing the whole server — customer login fails open into "feature unavailable" without an admin-auth outage. This entire flow — Firebase project setup, `backend/firebase-service-account.json`, `frontend/.env`'s `VITE_FIREBASE_*` values, enabling the Phone provider, and a Firebase test phone number — has since been configured and verified working end-to-end: real login, an inquiry linked to the resulting customer account, and that inquiry showing up correctly on `/account`.

### 3. What Customer JWTs Now Unlock

Previously, a customer JWT was issued on login but nothing on the backend ever checked it — there was no server-side notion of "this action is on behalf of logged-in customer X." That's now used by:
- `POST /api/v1/inquiries` (via `attachCustomerIfPresent`) — attaches `Inquiry.user` when a valid customer token is sent, silently proceeding anonymously otherwise
- `GET /api/v1/inquiries/mine` (via `protectUser`) — returns only the calling customer's own inquiries

The `user` field is set exclusively from the verified token (`req.customer._id`), never from the request body — an inquiry payload that includes a `user` field is explicitly ignored server-side (see [Security Features](#security-features)), so a client can't submit an inquiry "as" another customer by guessing their ID.

### No Password Reset Flow
Neither auth system has a forgot-password / resend-OTP-limit / account-recovery flow. Admins with a lost password have no self-service recovery path; customers re-authenticate via a fresh OTP each time by design (no password to forget). This remains a real gap — see [Remaining Gaps](#remaining-gaps).

---

## 🔒 Security Features

### What's Implemented
1. ✅ **Password hashing** — bcrypt via `AdminUser` pre-save hook, `select: false` hides the hash field by default
2. ✅ **JWT auth** for admin routes (`protect`) and customer routes (`protectUser`)
3. ✅ **Server-side Firebase token verification** for customer login (not trusting the client's claim of a verified phone number)
4. ✅ **Security headers** — `helmet()` mounted globally
5. ✅ **NoSQL injection sanitization** — `express-mongo-sanitize`, wrapped to mutate `req.body`/`req.params`/`req.query` in place instead of reassigning `req.query` (Express 5 compatibility)
6. ✅ **XSS sanitization** — `xss-clean`'s internal `clean()` function, wrapped the same way for the same Express 5 reason (its own middleware reassigns `req.query`, which would otherwise crash every request)
7. ✅ **HTTP Parameter Pollution protection** — `hpp()`, mounted as-is (its implementation already mutates in place, no Express 5 workaround needed)
8. ✅ **Rate limiting** — login endpoints (10/15min) and inquiry submission (5/hour), via `express-rate-limit`, correctly keyed by real client IP behind the Render proxy (`app.set('trust proxy', 1)`)
9. ✅ **Admin registration gated** — requires `ADMIN_REGISTER_KEY`, refused entirely if unset
10. ✅ **File upload restrictions** — Multer limited to jpeg/jpg/png, 5MB max, now via Cloudinary when configured (URLs, no local attack surface) or local disk otherwise
11. ✅ **Server-authoritative `Inquiry.user`** — never trusts a client-supplied `user`/`status` field on creation; only whitelisted fields plus the server-verified customer ID are persisted
12. ✅ **Centralized error handling** — avoids leaking raw Mongoose stack traces for common error classes

### Verifying the Express 5 sanitize/xss workaround actually works
Both wrappers were tested against a live request with `?sort=title&foo[$gt]=1` (NoSQL-operator-shaped query params) — the server responded 200 with correctly filtered results rather than throwing on the `req.query` reassignment, confirming the in-place-mutation approach is safe under Express 5's read-only `req.query` getter.

---

## 🕳️ Remaining Gaps

Resolved since the first pass: SMTP credentials (Mailtrap Sandbox), Cloudinary credentials, and full Firebase setup (service account + client config + Phone provider) are all now configured and confirmed live in the developer's own environment. What's still open:

1. **No password-reset or OTP-resend-rate-limit flow** for either auth system.
2. **No client-side protected-route wrapper** for `/admin/dashboard` — reliance on API-level 401s only. (`/account`, the customer equivalent, does redirect client-side.)
3. **Email delivery is configured but only smoke-tested via Sandbox, not production SMTP.** `SMTP_HOST`/`PORT`/`USER`/`PASS` now point at a real Mailtrap **Sandbox** inbox (catches mail in a fake inbox rather than delivering to real recipients) — correct for local dev, but swap to a production-grade SMTP/API provider (or Mailtrap's own live "Email API/SMTP" product with a verified sending domain) before real customers need to receive these emails.
4. **No automated tests** — verification was done via manual `curl`/browser checks (including live end-to-end runs in the developer's own terminal and browser) and the existing ad hoc scripts in `backend/scripts/` (`test_api.js`, `test_upload.js`, `test_security.js`, `test_error.js`), not an automated test suite.

---

## 🐛 Bugs Found & Fixed During Live Verification

Two real, pre-existing bugs surfaced while manually verifying the app end-to-end (not introduced by this pass, but caught and fixed while testing it):

### 1. `userAuthController.js` — dead "Firebase not configured" guard
```javascript
// Before (never actually triggers):
if (!admin) {
    return next(new ErrorResponse('Firebase Admin is not configured on the server', 500));
}
```
`backend/config/firebase.js` always exports `{ auth: () => adminAuth }` — that object itself is never falsy, even when `adminAuth` (the thing the function returns) is `null` because the service account file wasn't found. So this guard could never catch the actual "not configured" case. Instead, the very next line crashed with an unhandled `TypeError: Cannot read properties of null (reading 'verifyIdToken')`, which the surrounding `try/catch` masked into a misleading `"Invalid or expired Firebase token"` 401 — making a configuration problem look like a token/credentials problem.

**Fix:** check `!admin.auth()` instead of `!admin`, so the real condition is actually tested:
```javascript
if (!admin.auth()) {
    return next(new ErrorResponse('Firebase Admin is not configured on the server', 500));
}
```
Verified live: with the service account file still absent, the endpoint now correctly returns the clean `500 "Firebase Admin is not configured on the server"` instead of the crash-derived 401.

### 2. `TourDetails.jsx` — inquiry message duplicating on resubmission
The tour-detail inquiry modal's `onSubmit` handler appended travel-date/traveller-count text into the message field by **mutating React state in place**:
```javascript
// Before:
formData.message += `\n${dateMsg}${paxMsg}`;
```
Since this mutates the same object reference held in `formData` state (rather than going through `setFormData`), any resubmission of the form re-appended the date/traveller text onto whatever was already there — observed live as `"...Travel Date: 2026-07-06 Travellers: 5 Travel Date: 2026-07-06 Travellers: 5"` on a submitted inquiry.

**Fix:** compute the combined message fresh from state on every submit, without ever mutating `formData` directly:
```javascript
const dateMsg = inquiryData.date ? `\nTravel Date: ${inquiryData.date}` : ''
const paxMsg = inquiryData.travellers ? `\nTravellers: ${inquiryData.travellers}` : ''
const fullMessage = (dateMsg || paxMsg) ? `${formData.message}\n${dateMsg}${paxMsg}` : formData.message
// ...sent as message: fullMessage in the request body, formData itself untouched
```

---

## 🎤 Interview Questions & Answers

### General Questions

#### Q: "Explain the project in 2 minutes"
**A:** "I built a travel agency CMS and lead-generation platform using the MERN stack, decoupled into a separate Express API and a React/Vite SPA. It's deliberately not a booking engine — there's no payment flow — because trips like these are sold through a human follow-up, not self-serve checkout. Customers browse tour packages and group trips, view full itineraries and pricing options, log in with just a phone number via Firebase's OTP flow, and submit inquiries that land in an admin lead pipeline with Pending/Contacted/Closed status — and now get an automatic confirmation email and can review their own inquiry history on an account page. Admins have a separate, key-gated JWT login and manage the entire catalog — tours, locations, amenities — including nested pricing tiers and Cloudinary-backed photo uploads. The two auth systems are intentionally separate because admins and customers have very different trust levels and identity needs."

### Architecture Questions

#### Q: "Why two separate authentication systems instead of one?"
**A:** "Admins are a small, trusted internal group, so email/password plus a standard JWT is simple and appropriate. Customers are the general public, and requiring them to create a password before they can submit a travel inquiry is unnecessary friction — a phone number is both their natural identity and something the sales team needs anyway to call them back. Firebase Phone Auth handles the OTP delivery and bot-protection, and my backend just verifies the resulting ID token server-side before creating a user record and issuing its own JWT."

#### Q: "How did you connect the customer JWT to anything, once it was actually used?"
**A:** "I added a `protectUser` middleware mirroring the existing admin `protect` middleware, but decoding into the `User` collection instead of `AdminUser`. Since inquiry submission needs to stay public for anonymous visitors, I also added a non-blocking `attachCustomerIfPresent` middleware that quietly attaches the customer if a valid token is sent, but never rejects the request if it's missing or invalid. Critically, the `user` field on the created Inquiry is only ever set from the verified token — never from the request body — so nobody can submit an inquiry that shows up in someone else's 'My Inquiries' list just by guessing a Mongo ID."

### Security Questions

#### Q: "What security work did you actually do, and how did you verify it?"
**A:** "I mounted `hpp` and `xss-clean`, which were dependencies but never wired in. `xss-clean` needed a workaround, though — its middleware reassigns `req.query` directly, and Express 5 made `req.query` a getter with no setter, so using it as-is would throw on every request. I applied the same in-place-mutation trick the codebase already used for `express-mongo-sanitize`. I verified this wasn't just theoretical by booting the server and sending a request with NoSQL-operator-shaped query params — it came back 200 with correctly sanitized results instead of crashing. I also added rate limiting on login and inquiry endpoints, gated admin registration behind a server-side key (failing closed if the key isn't configured), and made sure `trust proxy` was set so the rate limiter keys by real client IP instead of the reverse proxy's IP."

#### Q: "Why gate admin registration with a shared secret instead of requiring an existing admin token?"
**A:** "Requiring an existing admin token to register a new admin creates a bootstrap problem — how does the very first admin get created? A shared `ADMIN_REGISTER_KEY`, generated once and kept out-of-band (in the server's env, not in the repo), lets whoever controls the deployment create admin accounts without needing a pre-existing one, while still closing off the previous fully-public endpoint to anyone who doesn't have that secret."

### Debugging Questions

#### Q: "Tell me about a bug you found and how you tracked it down."
**A:** "While verifying the customer login flow end-to-end, I hit a generic '401 Invalid or expired Firebase token' error. Rather than assume it was a bad token, I checked the backend's server-side logs — which is where the real exception gets logged before the code converts it into that generic client-facing message — and found a `TypeError: Cannot read properties of null (reading 'verifyIdToken')`. That told me `admin.auth()` itself was returning `null`, not that the token was invalid. Looking at the config module, it always exports an object with an `auth()` function on it, so an existing `if (!admin)` guard could never actually catch the 'not configured' case — it was checking the wrong thing entirely, silently papering over a real misconfiguration as if it were a credentials problem. I fixed the check to `if (!admin.auth())`, and separately, the actual root cause turned out to be that the Firebase service account file just hadn't been added yet — two different problems that looked identical from the client's point of view until I read the real server logs."

#### Q: "How did you find the inquiry-message duplication bug?"
**A:** "It showed up as visibly duplicated text in a submitted inquiry — the travel date and traveller count appended twice. I traced it to the modal's submit handler, which built that extra text and appended it directly onto `formData.message` using `+=` instead of going through `setFormData`. Because that mutates the same object React is holding in state, rather than replacing it, any resubmission of the form kept appending onto whatever was already there instead of starting fresh. The fix was to compute the combined message from scratch on every submit and only use it for that request's payload, never mutating the underlying state at all."

### Feature Questions

#### Q: "Walk me through the Cloudinary migration and why it has a fallback."
**A:** "I didn't want to make Cloudinary a hard requirement just to run the app locally, so I mirrored the pattern already used for Firebase Admin: check for the required env vars at startup, and if they're not there, fall back to the original behavior instead of crashing. `backend/middleware/upload.js` picks between `CloudinaryStorage` and Multer's local disk storage based on that check. The tricky part was that Cloudinary's storage engine and local disk storage populate different fields on `req.file` with different meanings — Cloudinary's `file.path` is the actual hosted URL, while local disk's `file.path` is a filesystem path you'd never want to store or serve. So I added a small `fileRef()` helper in the controller that reads the right field depending on which mode is active, and updated the frontend's image rendering to detect and handle both a bare filename and a full URL."

---

## 🚀 Potential Improvements

Still open, roughly in priority order:

### 1. Move from Mailtrap Sandbox to Production Email
Sandbox is correct for local dev (catches mail without delivering it), but a production-grade SMTP/API provider (or a verified sending domain on Mailtrap's live product) is needed before real customers should receive these confirmation emails.

### 2. Password Reset / Account Recovery
Neither auth system has one. For admins specifically, a lost password currently has no self-service recovery path.

### 3. Client-Side Protected Route for `/admin/dashboard`
Add a `<ProtectedRoute>`-style wrapper that checks for `adminToken` and redirects before rendering, matching what `/account` already does for customers, instead of relying solely on API-level 401s.

### 4. Automated Tests
The `backend/scripts/test_*.js` files are useful manual smoke tests but aren't runnable as an automated suite (no assertions, no CI). Worth formalizing into Jest/Supertest if the team wants CI coverage — deliberately out of scope for this pass per project decision (no new test framework introduced alongside the security/feature work).

### 5. Rotate the Local `.env`'s Secrets Before Any Public Deployment
The repo's local `.env` (gitignored, never committed) contains a real MongoDB Atlas connection string, JWT secret, and live Cloudinary/Mailtrap credentials used during development — worth rotating before this environment is treated as anything beyond a personal dev sandbox.

---

## 📝 Summary

### Elevator Pitch (30 seconds)
*"I built a travel agency CMS and lead-generation platform on the MERN stack — a decoupled Express API and React/Vite SPA. It's intentionally not a booking engine: customers browse tour packages and group trips, log in with just a phone number via Firebase OTP, and submit inquiries that land in an admin lead pipeline, now with automatic email confirmations and a personal inquiry history page. Admins get a separate, key-gated JWT login to manage the full catalog, including nested pricing tiers, departures, and Cloudinary-backed photo galleries — with rate limiting, XSS/NoSQL sanitization, and HTTP parameter pollution protection all verified working under Express 5."*

### Technical Highlights
1. ✅ Decoupled React/Vite frontend + Express 5 backend
2. ✅ Two independent auth schemes matched to two different trust levels (admin JWT, customer Firebase-OTP-to-JWT), both now actually enforced end-to-end (`protect` and `protectUser`)
3. ✅ Generic `advancedResults` middleware for filter/sort/paginate across any Mongoose model, now backed by indexes on the fields it's actually filtered by
4. ✅ Lead-pipeline-centric data model (`Inquiry.status`, `Inquiry.user`) instead of a booking/payment model, with server-authoritative customer linkage
5. ✅ Cloudinary-backed photo/gallery uploads with a local-disk fallback, type/size restrictions
6. ✅ Rate limiting, mounted XSS/NoSQL/HPP sanitization (with documented and tested Express-5 compatibility workarounds), and key-gated admin registration

### Remaining Work (Show Growth Mindset)
- Move from Mailtrap Sandbox to a production-grade email setup
- Add password-reset/account-recovery flows
- Client-side protected route for the admin dashboard
- Formalize the manual test scripts into an automated suite
- Rotate development secrets before any public deployment

### What "Verified" Actually Means Here
Every major feature in this document was confirmed working via a live, hands-on pass rather than just "should work" from reading the code: rate limiting was driven past its threshold and observed flipping from `401` to `429`; admin registration was tested both with and without the key; a real photo upload was traced into Cloudinary's Media Library and its exact filename/folder confirmed; and the full Firebase phone-OTP login was completed end-to-end, including a submitted inquiry showing up correctly on the resulting `/account` page. Two real bugs (see [Bugs Found & Fixed](#bugs-found--fixed-during-live-verification)) only surfaced because of this live verification, not from reading the code alone — a reminder that "the code looks right" and "the feature works" are different claims.

---

*This documentation was generated from a direct codebase read on July 16, 2026, then updated the same day after implementing and manually verifying (via booted servers, curl, and a live browser session) a security/feature hardening pass: stale `client/`/`server/` removal, wired-up email notifications, mounted `hpp`/`xss-clean` with Express-5-safe wrappers, rate limiting, key-gated admin registration, new DB indexes, Cloudinary uploads with local fallback, and a customer-facing "My Inquiries" flow - then updated once more after full Firebase phone/OTP login was configured and verified live, and two real bugs were found and fixed along the way.*
