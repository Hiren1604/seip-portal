const express = require('express');
const router = express.Router();

// Mock data fallback (used when Firebase is not configured)
const MOCK_MENTORS = [
  {
    id: 'mentor1',
    name: 'Arjun Mehta',
    title: 'AI & ML Expert',
    company: 'ex-Google',
    rating: 4.9,
    reviews: 32,
    experience: '10+ Years',
    availability: 'Available',
    nextSlot: 'Tomorrow, 11:00 AM',
    tags: ['AI/ML', 'Product Strategy', 'Fundraising'],
  },
  {
    id: 'mentor2',
    name: 'Neha Kapoor',
    title: 'Marketing Strategist',
    company: 'ex-Microsoft',
    rating: 4.8,
    reviews: 18,
    experience: '8+ Years',
    availability: 'Available',
    nextSlot: 'Today, 04:00 PM',
    tags: ['Growth Marketing', 'Branding', 'Go-to-Market'],
  },
  {
    id: 'mentor3',
    name: 'Rohit Verma',
    title: 'FinTech Advisor',
    company: 'ex-Paytm',
    rating: 4.7,
    reviews: 27,
    experience: '12+ Years',
    availability: 'Busy',
    nextSlot: '25 May, 10:00 AM',
    tags: ['FinTech', 'Financial Modeling', 'Funding'],
  },
];

// In-memory store for requests (when Firebase not available)
const mockRequests = [];

function getDb() {
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length > 0) return admin.firestore();
  } catch { /* ignore */ }
  return null;
}

// GET /api/mentors — fetch all mentors
router.get('/', async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.json(MOCK_MENTORS);
  }
  try {
    const snap = await db.collection('mentors').get();
    const mentors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(mentors.length ? mentors : MOCK_MENTORS);
  } catch (err) {
    console.error('Error fetching mentors:', err);
    res.json(MOCK_MENTORS);
  }
});

// POST /api/mentors/request — create mentorship request
router.post('/request', async (req, res) => {
  const { userId, mentorId, mentorName, requestedOn } = req.body;
  if (!userId || !mentorId) {
    return res.status(400).json({ error: 'userId and mentorId are required' });
  }

  const db = getDb();
  if (!db) {
    mockRequests.push({ userId, mentorId, mentorName, requestedOn, status: 'Pending', createdAt: new Date().toISOString() });
    return res.json({ success: true, message: 'Request recorded (mock mode)' });
  }

  try {
    await db.collection('mentorshipRequests').add({
      userId, mentorId, mentorName, requestedOn, status: 'Pending',
      createdAt: new Date().toISOString(),
    });
    res.json({ success: true, message: 'Mentorship request sent!' });
  } catch (err) {
    console.error('Error saving request:', err);
    res.status(500).json({ error: 'Failed to save request' });
  }
});

// GET /api/mentors/requests/:userId — fetch user's requests
router.get('/requests/:userId', async (req, res) => {
  const { userId } = req.params;
  const db = getDb();

  if (!db) {
    return res.json(mockRequests.filter(r => r.userId === userId));
  }

  try {
    const snap = await db.collection('mentorshipRequests')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.json([]);
  }
});

module.exports = router;
