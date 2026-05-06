require('dotenv').config();
const admin = require('firebase-admin');

async function seedInvestor() {
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
    throw new Error('No Firebase service account found');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      })
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  const userEmail = 'investor@nexusai.com';
  const userPassword = 'Investor2024!';
  let uid;

  try {
    const userRecord = await auth.getUserByEmail(userEmail);
    uid = userRecord.uid;
    console.log(`Investor user already exists: ${uid}`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: userEmail,
        password: userPassword,
        displayName: 'Venture Capitalist',
      });
      uid = newUser.uid;
      console.log(`Created new investor user: ${uid}`);
    } else {
      throw error;
    }
  }

  const profileData = {
    fullName: 'David Sterling',
    email: userEmail,
    phone: '+1 (555) 987-6543',
    country: 'United Kingdom',
    role: 'investor',
    company: 'Sterling Venture Partners',
    position: 'Managing Director',
    bio: 'Dedicated to early-stage AI startups that solve real-world industrial problems. Focus on FinTech and AgriTech sectors.',
    interests: ['AI/ML', 'FinTech', 'SaaS'],
    investmentRange: '$50k - $500k',
    totalInvestments: 14,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('users').doc(uid).set(profileData, { merge: true });
  console.log('✅ Injected Investor profile data into Firestore.');

  // Create some mock interest records for this investor
  const interestRecords = [
    {
      investorId: uid,
      investorName: profileData.fullName,
      startupId: 'demo_startup_id',
      startupName: 'Nexus AI',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    },
    {
      investorId: uid,
      investorName: profileData.fullName,
      startupId: 'another_startup',
      startupName: 'EcoStream',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'contacted'
    }
  ];

  const interestRef = db.collection('investorInterest');
  for (const record of interestRecords) {
    await interestRef.add(record);
  }
  console.log('✅ Injected mock investor interest records.');

  console.log('\n=============================================');
  console.log('🎉 INVESTOR ACCOUNT CREATED SUCCESSFULLY!');
  console.log(`Email: ${userEmail}`);
  console.log(`Password: ${userPassword}`);
  console.log(`Role: investor`);
  console.log('=============================================\n');

  process.exit(0);
}

seedInvestor().catch(console.error);
