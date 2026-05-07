require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
let firebaseInitialized = false;
try {
  let saString = process.env.FIREBASE_SERVICE_ACCOUNT;
  let serviceAccount;

  try {
    // Try loading from file first
    serviceAccount = require('./serviceAccountKey.json');
    console.log('✅ Loading Firebase Admin from serviceAccountKey.json');
  } catch (e) {
    // Fallback to env var
    if (saString) {
      serviceAccount = JSON.parse(saString);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      console.log('✅ Loading Firebase Admin from environment variable');
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      })
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } else {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized (application default)');
  }
} catch (err) {
  console.warn('⚠️  Firebase Admin not initialized — using mock data mode:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
const mentorsRouter = require('./routes/mentors');
app.use('/api/mentors', mentorsRouter);

const aiInsightsRouter = require('./routes/aiInsights');
app.use('/api/ai-insights', aiInsightsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', firebase: firebaseInitialized, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { admin, firebaseInitialized };
