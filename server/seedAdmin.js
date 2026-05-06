require('dotenv').config();
const admin = require('firebase-admin');

async function seedAdmin() {
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

  const userEmail = 'admin@seip.com';
  const userPassword = 'AdminPassword123!';
  let uid;

  try {
    const userRecord = await auth.getUserByEmail(userEmail);
    uid = userRecord.uid;
    console.log(`Admin user already exists: ${uid}`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: userEmail,
        password: userPassword,
        displayName: 'SEIP Administrator',
      });
      uid = newUser.uid;
      console.log(`Created new admin user: ${uid}`);
    } else {
      throw error;
    }
  }

  const profileData = {
    fullName: 'SEIP Administrator',
    email: userEmail,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('users').doc(uid).set(profileData, { merge: true });
  console.log('✅ Injected Admin profile data into Firestore.');

  console.log('\n=============================================');
  console.log('🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!');
  console.log(`Email: ${userEmail}`);
  console.log(`Password: ${userPassword}`);
  console.log(`Role: admin`);
  console.log('=============================================\n');

  process.exit(0);
}

seedAdmin().catch(console.error);
