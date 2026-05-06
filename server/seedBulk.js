require('dotenv').config();
const admin = require('firebase-admin');

async function seedBulk() {
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

  if (!serviceAccount) throw new Error('No Firebase service account found');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      })
    });
  }

  const db = admin.firestore();
  const auth = admin.auth();

  const industries = ['FinTech', 'HealthTech', 'EdTech', 'AI/ML', 'AgriTech', 'CleanTech', 'SaaS'];
  const stages = ['Idea', 'MVP', 'Growth', 'Scale'];

  const founders = [
    { name: 'Sarah Chen', email: 'sarah@innovate.com', startup: 'PulseAI', industry: 'HealthTech', stage: 'MVP' },
    { name: 'Marcus Thorne', email: 'marcus@future.io', startup: 'EcoStream', industry: 'CleanTech', stage: 'Idea' },
    { name: 'Priya Sharma', email: 'priya@edugrow.com', startup: 'EduGrow', industry: 'EdTech', stage: 'Growth' },
    { name: 'Alex Rivera', email: 'alex@vault.co', startup: 'VaultPay', industry: 'FinTech', stage: 'Scale' },
    { name: 'Chen Wei', email: 'wei@agribot.io', startup: 'AgriBot', industry: 'AgriTech', stage: 'MVP' },
    { name: 'Emma Wilson', email: 'emma@cloudnine.com', startup: 'CloudNine', industry: 'SaaS', stage: 'Growth' },
    { name: 'Kofi Mensah', email: 'kofi@securenet.io', startup: 'SecureNet', industry: 'AI/ML', stage: 'Idea' },
    { name: 'Liam O\'Brien', email: 'liam@harvest.com', startup: 'HarvestAI', industry: 'AgriTech', stage: 'Scale' },
    { name: 'Sofia Rossi', email: 'sofia@medlink.com', startup: 'MedLink', industry: 'HealthTech', stage: 'Growth' },
    { name: 'Yuki Tanaka', email: 'yuki@zenpay.com', startup: 'ZenPay', industry: 'FinTech', stage: 'MVP' },
  ];

  const investors = [
    { name: 'James Wilson', email: 'james@capital.com', company: 'Wilson Capital' },
    { name: 'Elena Vance', email: 'elena@vance.io', company: 'Vance Ventures' },
    { name: 'Raj Patel', email: 'raj@globalinvest.com', company: 'Global Invest Group' },
  ];

  console.log('--- Starting Bulk Seeding ---');

  for (const f of founders) {
    try {
      let uid;
      try {
        const user = await auth.getUserByEmail(f.email);
        uid = user.uid;
      } catch {
        const user = await auth.createUser({ email: f.email, password: 'Password123!', displayName: f.name });
        uid = user.uid;
      }

      await db.collection('users').doc(uid).set({
        fullName: f.name,
        email: f.email,
        role: 'founder',
        startupName: f.startup,
        industry: f.industry,
        stage: f.stage,
        teamSize: Math.floor(Math.random() * 20) + 1,
        onboardingComplete: true,
        description: `${f.startup} is a leading innovator in the ${f.industry} space, focused on delivering scalable solutions for ${f.stage} stage challenges.`,
        problem: `Current solutions in ${f.industry} are inefficient and lack modern AI integration.`,
        targetAudience: 'Global enterprise clients',
        revenueModel: 'SaaS Subscription',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`Added Founder: ${f.name}`);
    } catch (e) { console.error(`Error adding ${f.name}:`, e.message); }
  }

  for (const i of investors) {
    try {
      let uid;
      try {
        const user = await auth.getUserByEmail(i.email);
        uid = user.uid;
      } catch {
        const user = await auth.createUser({ email: i.email, password: 'Password123!', displayName: i.name });
        uid = user.uid;
      }

      await db.collection('users').doc(uid).set({
        fullName: i.name,
        email: i.email,
        role: 'investor',
        company: i.company,
        onboardingComplete: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`Added Investor: ${i.name}`);
    } catch (e) { console.error(`Error adding ${i.name}:`, e.message); }
  }

  // Add some Mentorship Requests
  const mentors = ['Arjun Mehta', 'Neha Kapoor', 'Rohit Verma', 'Sarah Johnson'];
  const userDocs = await db.collection('users').where('role', '==', 'founder').get();
  
  for (const doc of userDocs.docs) {
    if (Math.random() > 0.5) {
      const mentor = mentors[Math.floor(Math.random() * mentors.length)];
      await db.collection('mentorshipRequests').add({
        userId: doc.id,
        mentorName: mentor,
        status: Math.random() > 0.5 ? 'Accepted' : 'Pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
  console.log('Added Mentorship Requests');

  // Add some Investor Interests
  const investorDocs = await db.collection('users').where('role', '==', 'investor').get();
  for (const iDoc of investorDocs.docs) {
    const randomFounders = userDocs.docs.sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const fDoc of randomFounders) {
      await db.collection('investorInterest').add({
        investorId: iDoc.id,
        investorName: iDoc.data().fullName,
        startupId: fDoc.id,
        startupName: fDoc.data().startupName,
        status: 'pending',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
  console.log('Added Investor Interests');

  console.log('\n✅ Bulk Seeding Complete!');
  process.exit(0);
}

seedBulk().catch(console.error);
