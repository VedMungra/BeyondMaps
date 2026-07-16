const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
let adminAuth = null;

// Initialize Firebase Admin only if the service account file exists
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  adminAuth = getAuth(app);
  console.log('Firebase Admin Initialized successfully.');
} else {
  console.log('WARNING: firebase-service-account.json not found in root directory. Firebase Admin not initialized.');
}

// Export a wrapper that matches the old admin.auth() syntax
module.exports = {
  auth: () => adminAuth
};
