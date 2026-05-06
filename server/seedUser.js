require('dotenv').config();
const admin = require('firebase-admin');

async function seedUser() {
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

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key
    })
  });

  const auth = admin.auth();
  const db = admin.firestore();

  const userEmail = 'demo@nexusai.com';
  const userPassword = 'Nexus2024!';
  let uid;

  try {
    const userRecord = await auth.getUserByEmail(userEmail);
    uid = userRecord.uid;
    console.log(`User already exists: ${uid}`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: userEmail,
        password: userPassword,
        displayName: 'Innovator Labs',
      });
      uid = newUser.uid;
      console.log(`Created new user: ${uid}`);
    } else {
      throw error;
    }
  }

  const profileData = {
    fullName: 'Innovator Labs',
    email: userEmail,
    phone: '+1 (555) 123-4567',
    country: 'United States',
    role: 'Founder',
    language: 'English',
    startupName: 'Nexus AI',
    industry: 'AI/ML',
    stage: 'Growth',
    teamSize: 12,
    description: 'Nexus AI is revolutionizing the way businesses interact with data by providing deep-learning powered predictive analytics in real-time.',
    problem: 'Current analytics tools are too slow and require data scientists to interpret. Small businesses cannot afford them.',
    targetAudience: 'SMEs, E-commerce, FinTech',
    revenueModel: 'SaaS Subscription (B2B)',
    onboardingComplete: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    
    // Performance & Dashboard Mock Data
    metrics: {
      totalStartups: 128,
      activeStartups: 86,
      totalFunding: 24500000,
      growthRate: 18.6,
      ideaFeasibilityScore: 75,
    },
    activities: [
      { id: '1', title: 'Mentorship request accepted by Sarah Johnson', timeAgo: '10 min ago', type: 'success' },
      { id: '2', title: 'Performance report generated for Q2 2024', timeAgo: '1 hour ago', type: 'info' },
      { id: '3', title: 'Compliance checklist updated successfully', timeAgo: '2 hours ago', type: 'warning' },
      { id: '4', title: 'Sandbox environment created for your project', timeAgo: '3 hours ago', type: 'code' },
    ],
    tasks: [
      { id: 't1', title: 'Complete Business Profile', due: '25 May 2024', status: 'completed' },
      { id: 't2', title: 'AI Idea Evaluation', due: '28 May 2024', status: 'pending' },
      { id: 't3', title: 'Compliance Verification', due: '30 May 2024', status: 'upcoming' },
    ]
  };

  await db.collection('users').doc(uid).set(profileData, { merge: true });
  console.log('✅ Injected rich profile data into Firestore.');

  // Also create a few mock mentorship requests for this user
  const mentorRequests = [
    {
      mentorName: 'Arjun Mehta',
      mentorTitle: 'AI & ML Expert',
      status: 'In Progress',
      requestedOn: '20 May 2024',
      userId: uid
    },
    {
      mentorName: 'Neha Kapoor',
      mentorTitle: 'Marketing Strategist',
      status: 'Pending',
      requestedOn: '21 May 2024',
      userId: uid
    },
    {
      mentorName: 'Rohit Verma',
      mentorTitle: 'FinTech Advisor',
      status: 'Accepted',
      requestedOn: '18 May 2024',
      userId: uid
    }
  ];

  const requestsRef = db.collection('mentorshipRequests');
  // Clean up old ones for this user to avoid duplicates on re-run
  const oldRequests = await requestsRef.where('userId', '==', uid).get();
  const batch = db.batch();
  oldRequests.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  for (const req of mentorRequests) {
    await requestsRef.add(req);
  }
  console.log('✅ Injected mock mentorship requests.');

  console.log('\n=============================================');
  console.log('🎉 ID PASS CREATED SUCCESSFULLY!');
  console.log(`Email: ${userEmail}`);
  console.log(`Password: ${userPassword}`);
  console.log('=============================================\n');

  process.exit(0);
}

seedUser().catch(console.error);
