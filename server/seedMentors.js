require('dotenv').config();
const admin = require('firebase-admin');

const MENTORS = [
  {
    name: 'Arjun Mehta', title: 'AI & ML Expert', company: 'ex-Google',
    rating: 4.9, reviews: 32, experience: '10+ Years', availability: 'Available',
    nextSlot: 'Tomorrow, 11:00 AM', tags: ['AI/ML', 'Product Strategy', 'Fundraising'],
  },
  {
    name: 'Neha Kapoor', title: 'Marketing Strategist', company: 'ex-Microsoft',
    rating: 4.8, reviews: 18, experience: '8+ Years', availability: 'Available',
    nextSlot: 'Today, 04:00 PM', tags: ['Growth Marketing', 'Branding', 'Go-to-Market'],
  },
  {
    name: 'Rohit Verma', title: 'FinTech Advisor', company: 'ex-Paytm',
    rating: 4.7, reviews: 27, experience: '12+ Years', availability: 'Busy',
    nextSlot: '25 May, 10:00 AM', tags: ['FinTech', 'Financial Modeling', 'Funding'],
  },
];

async function seed() {
  let saString = process.env.FIREBASE_SERVICE_ACCOUNT;
  let serviceAccount;

  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {
    if (saString) {
      serviceAccount = JSON.parse(saString);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
    }
  }

  if (!serviceAccount) {
    throw new Error('No Firebase service account found (check .env or serviceAccountKey.json)');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key
    })
  });
  const db = admin.firestore();

  for (const mentor of MENTORS) {
    await db.collection('mentors').add(mentor);
    console.log(`✅ Seeded: ${mentor.name}`);
  }
  console.log('🌱 Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
