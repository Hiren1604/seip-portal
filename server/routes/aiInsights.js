const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * POST /api/ai-insights
 * Body: { profile: { ...onboarding fields } }
 * Returns structured AI insights from Gemini
 */
router.post('/', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }

    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Profile data is required.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview' });

    const prompt = buildPrompt(profile);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the JSON response from Gemini
    let insights;
    try {
      // Extract JSON block if Gemini wraps it in markdown
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      insights = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('Gemini JSON parse failed, returning raw text:', parseErr);
      insights = { raw: text };
    }

    res.json({ success: true, insights });
  } catch (err) {
    console.error('AI Insights error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate AI insights.' });
  }
});

function buildPrompt(profile) {
  const {
    fullName = 'Unknown', startupName = 'Unknown', industry = 'Unknown',
    stage = 'Unknown', teamSize = 0, country = 'Unknown',
    description = '', problem = '', targetAudience = '', revenueModel = 'Unknown',
    role = 'Unknown', website = '',
  } = profile;

  return `
You are an expert startup advisor and venture capital analyst. Analyze the following startup profile and provide detailed, actionable AI-powered insights.

## Startup Profile
- **Founder:** ${fullName} (${role})
- **Startup Name:** ${startupName}
- **Country:** ${country}
- **Industry:** ${industry}
- **Stage:** ${stage}
- **Team Size:** ${teamSize} people
- **Revenue Model:** ${revenueModel}
- **Website:** ${website || 'Not provided'}
- **Description:** ${description || 'Not provided'}
- **Problem Being Solved:** ${problem || 'Not provided'}
- **Target Audience:** ${targetAudience || 'Not provided'}

## Instructions
Based on this profile, provide a comprehensive analysis in the following JSON format. Be specific, data-driven, and reference the actual startup details. Each insight must be directly relevant to THIS startup, not generic advice.

Return ONLY valid JSON (no markdown, no extra text):

{
  "overallScore": <number 0-100 representing overall startup health/potential>,
  "scoreLabel": "<short label like 'Strong Potential' | 'Needs Work' | 'Early Stage' | 'Investor Ready'>",
  "summary": "<2-3 sentence executive summary of the startup's current position and potential>",
  "strengths": [
    { "title": "<strength title>", "detail": "<specific actionable detail referencing their data>" },
    { "title": "<strength title>", "detail": "<specific actionable detail referencing their data>" },
    { "title": "<strength title>", "detail": "<specific actionable detail referencing their data>" }
  ],
  "weaknesses": [
    { "title": "<gap/weakness title>", "detail": "<specific advice to address it>" },
    { "title": "<gap/weakness title>", "detail": "<specific advice to address it>" }
  ],
  "recommendations": [
    { "priority": "High", "action": "<specific actionable recommendation>", "impact": "<expected outcome>" },
    { "priority": "High", "action": "<specific actionable recommendation>", "impact": "<expected outcome>" },
    { "priority": "Medium", "action": "<specific actionable recommendation>", "impact": "<expected outcome>" }
  ],
  "investorReadiness": {
    "score": <number 0-100>,
    "tips": [
      "<specific tip for making this startup more attractive to investors>",
      "<specific tip for making this startup more attractive to investors>",
      "<specific tip for making this startup more attractive to investors>"
    ]
  },
  "marketOpportunity": "<2-3 sentences on the market opportunity for this specific industry/stage combination>",
  "nextMilestone": "<The single most important next milestone this startup should achieve in the next 90 days>"
}
`.trim();
}

module.exports = router;
