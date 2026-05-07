import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, RefreshCw, ThumbsUp, AlertTriangle, Lightbulb,
  Target, Star, Rocket, CheckCircle2, TrendingUp, BarChart3,
  ShieldCheck, Users, Zap, ArrowRight, Clock, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Hardcoded fallback data ─────────────────────────────────────── */
const FALLBACK_INSIGHTS = {
  overallScore: 72,
  scoreLabel: 'Strong Early Traction',
  summary:
    'Your startup shows solid fundamentals with a clearly defined problem and a promising target audience. The team structure needs strengthening and your go-to-market strategy requires more detail to attract institutional investors. Focus on building traction metrics and refining your revenue model over the next quarter.',
  nextMilestone:
    'Achieve first 100 paying customers and document unit economics (CAC, LTV, churn) before approaching seed-stage investors.',
  strengths: [
    { title: 'Clear Problem Statement', detail: 'You have articulated a well-defined pain point with measurable impact on your target market.' },
    { title: 'Defined Target Audience', detail: 'Your customer segment is specific and reachable, lowering initial acquisition costs.' },
    { title: 'Innovative Revenue Model', detail: 'Your SaaS-based subscription model aligns well with industry expectations and investor preferences.' },
    { title: 'Market Timing', detail: 'The market is experiencing tailwinds that favour your solution in the current economic climate.' },
  ],
  weaknesses: [
    { title: 'Team Completeness', detail: 'Missing a technical co-founder or CTO. Investors will flag this as a risk at pre-seed and seed stages.' },
    { title: 'Traction Evidence', detail: 'No quantified traction data (MRR, DAU, pilot customers) shared yet — this is the #1 ask from VCs.' },
    { title: 'Competitive Differentiation', detail: 'The moat against established players has not been clearly articulated beyond features.' },
    { title: 'Financial Projections', detail: '18-month runway plan and unit economics are absent from the current profile.' },
  ],
  recommendations: [
    { action: 'Build a Minimum Viable Product (MVP) within 60 days', priority: 'High', impact: 'Converts your idea into a tangible asset investors can evaluate and gives you real user feedback loops.' },
    { action: 'Launch a pilot with 10 design-partner customers', priority: 'High', impact: 'Provides social proof, testimonials, and early revenue that dramatically improves fundraising outcomes.' },
    { action: 'Recruit a technical co-founder or senior engineer', priority: 'High', impact: 'Closes the single biggest risk flag in your current team profile for seed-stage investors.' },
    { action: 'Define 3-year financial model with scenario analysis', priority: 'Medium', impact: 'Enables data-driven conversations with investors and boards; signals operational maturity.' },
    { action: 'Build a content & SEO growth channel', priority: 'Medium', impact: 'Reduces paid CAC over time and builds organic brand authority in your vertical.' },
  ],
  investorReadiness: {
    score: 58,
    tips: [
      'Prepare a concise 10-slide pitch deck following the Sequoia/YC format.',
      'Document all IP ownership, cap table, and legal incorporation details.',
      'Create a one-page executive summary highlighting traction and market size.',
      'Set up a virtual data room with financials, team bios, and product demo.',
      'Research 20 target investors who have invested in similar stage/vertical companies.',
    ],
  },
  marketOpportunity:
    'The global addressable market for your sector is estimated at $4.2B by 2028, growing at a 18% CAGR. Early mover advantage in emerging markets gives you a 2-3 year window before incumbents consolidate. Your niche focus positions you to capture 0.5–2% market share within 5 years, implying $21M–$84M in potential ARR.',
  riskFactors: [
    { risk: 'Regulatory changes in data privacy laws', level: 'Medium', mitigation: 'Implement GDPR-compliant data handling from day one; consult a legal advisor.' },
    { risk: 'Well-funded competitor entering the space', level: 'High', mitigation: 'Accelerate customer lock-in through integrations and switching costs.' },
    { risk: 'Key-person dependency on founder', level: 'Medium', mitigation: 'Document processes and hire a second leadership team member within 6 months.' },
  ],
  actionPlan: [
    { phase: 'Month 1–2', title: 'MVP & Pilot Launch', tasks: ['Finalize MVP feature scope', 'Sign 5 beta users', 'Set up analytics dashboard'] },
    { phase: 'Month 3–4', title: 'Traction & Metrics', tasks: ['Hit 10 paying customers', 'Document CAC and LTV', 'Launch referral program'] },
    { phase: 'Month 5–6', title: 'Fundraising Prep', tasks: ['Complete pitch deck', 'Build investor pipeline', 'Schedule 30 investor meetings'] },
  ],
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function ArcGauge({ pct, color = '#6366f1', size = 160 }) {
  const r = (size / 2) - 12;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

function ScoreBar({ label, value, color = '#6366f1' }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-bold text-slate-800">{value}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const cls = level === 'High'
    ? 'bg-red-100 text-red-600'
    : level === 'Medium'
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-green-100 text-green-700';
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{level}</span>;
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function AIReport() {
  const { userProfile } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setUsingFallback(false);
    try {
      const res = await fetch('http://localhost:5000/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      setInsights(data.insights);
      setLastFetched(new Date());
    } catch {
      setInsights(FALLBACK_INSIGHTS);
      setUsingFallback(true);
      setLastFetched(new Date());
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const gaugeColor =
    (insights?.overallScore ?? 0) >= 75 ? '#22c55e' :
    (insights?.overallScore ?? 0) >= 50 ? '#6366f1' :
    (insights?.overallScore ?? 0) >= 30 ? '#f97316' : '#ef4444';

  const tabs = [
    { id: 'overview',     label: 'Overview',         icon: BarChart3 },
    { id: 'strengths',    label: 'SWOT Analysis',    icon: ThumbsUp },
    { id: 'recommend',    label: 'Recommendations',  icon: Lightbulb },
    { id: 'investor',     label: 'Investor Readiness', icon: Star },
    { id: 'action',       label: '90-Day Plan',      icon: Rocket },
    { id: 'risks',        label: 'Risk Factors',     icon: ShieldCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles size={22} className="text-indigo-500" /> AI Startup Report
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Powered by Gemini AI — personalized analysis of your startup profile
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingFallback && (
            <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-medium">
              ⚡ Demo Report (AI unavailable)
            </span>
          )}
          {lastFetched && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock size={11} /> {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing…' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-card p-10 flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={18} className="text-indigo-500" />
            </div>
          </div>
          <p className="font-bold text-text-primary">Gemini is analyzing your startup…</p>
          <p className="text-sm text-text-secondary">This usually takes 5–10 seconds</p>
        </div>
      )}

      {!loading && insights && (
        <>
          {/* Score hero */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
              <div className="relative shrink-0">
                <ArcGauge pct={insights.overallScore} color={gaugeColor} size={160} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-text-primary">{insights.overallScore}</span>
                  <span className="text-[11px] text-slate-400 font-medium">/ 100</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-text-primary">{insights.scoreLabel}</h2>
                  <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full">GEMINI AI</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{insights.summary}</p>
                <div className="grid grid-cols-3 gap-3">
                  <ScoreBar label="Investor Readiness" value={insights.investorReadiness?.score ?? 58} color="#6366f1" />
                  <ScoreBar label="Market Opportunity" value={74} color="#22c55e" />
                  <ScoreBar label="Team Strength" value={45} color="#f97316" />
                </div>
              </div>
              <div className="shrink-0 p-4 bg-indigo-50 rounded-xl max-w-[220px]">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Rocket size={11} /> Next 90-Day Milestone
                </p>
                <p className="text-xs text-text-primary font-medium leading-relaxed">{insights.nextMilestone}</p>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex items-center gap-1 bg-white rounded-2xl shadow-card p-1.5 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                  ${activeTab === id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <ThumbsUp size={15} className="text-green-500" /> Key Strengths
                </p>
                <div className="space-y-2">
                  {insights.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-green-50 rounded-xl">
                      <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-orange-500" /> Areas to Improve
                </p>
                <div className="space-y-2">
                  {insights.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-orange-50 rounded-xl">
                      <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{w.title}</p>
                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{w.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-2xl shadow-card p-5">
                <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <Target size={15} className="text-purple-500" /> Market Opportunity
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">{insights.marketOpportunity}</p>
              </div>
            </div>
          )}

          {activeTab === 'strengths' && (
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">✅ Strengths</p>
                <div className="space-y-2">
                  {insights.strengths.map((s, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded-xl">
                      <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">⚠️ Weaknesses</p>
                <div className="space-y-2">
                  {insights.weaknesses.map((w, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-xl">
                      <p className="text-xs font-semibold text-text-primary">{w.title}</p>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{w.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">🚀 Opportunities</p>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-xl"><p className="text-[11px] text-text-secondary leading-relaxed">{insights.marketOpportunity}</p></div>
                  <div className="p-3 bg-blue-50 rounded-xl"><p className="text-xs font-semibold text-text-primary">Emerging Market Gaps</p><p className="text-[11px] text-text-secondary mt-1">Underserved SME segments present a fast-growth entry opportunity with lower competition.</p></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">🔥 Threats</p>
                <div className="space-y-2">
                  {insights.riskFactors.map((r, i) => (
                    <div key={i} className="p-3 bg-orange-50 rounded-xl flex items-start gap-2">
                      <RiskBadge level={r.level} />
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{r.risk}</p>
                        <p className="text-[11px] text-text-secondary mt-1">{r.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommend' && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <p className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5">
                <Lightbulb size={16} className="text-yellow-500" /> Top Recommendations
              </p>
              <div className="space-y-3">
                {insights.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-text-primary">{r.action}</p>
                        <RiskBadge level={r.priority} />
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="font-semibold text-indigo-600">Impact: </span>{r.impact}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'investor' && (
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <Star size={15} className="text-indigo-500" /> Investor Readiness Score
                  </p>
                  <span className="text-2xl font-black text-indigo-600">{insights.investorReadiness?.score}/100</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${insights.investorReadiness?.score}%` }} />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your startup is approaching investor-ready status. Follow the checklist on the right to close the gap and increase your chances of a successful raise.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-sm font-bold text-text-primary mb-3">Investor Readiness Checklist</p>
                <div className="space-y-2">
                  {(insights.investorReadiness?.tips || []).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-indigo-50 rounded-xl">
                      <span className="text-xs font-bold text-indigo-600 shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-4">
              {(insights.actionPlan || []).map((phase, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{phase.phase}</p>
                      <p className="text-sm font-bold text-text-primary">{phase.title}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {phase.tasks.map((task, j) => (
                      <div key={j} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                        <CheckCircle2 size={13} className="text-indigo-400 shrink-0" />
                        <p className="text-[11px] text-text-secondary">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <p className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-red-500" /> Risk Assessment
              </p>
              <div className="space-y-3">
                {(insights.riskFactors || []).map((r, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <RiskBadge level={r.level} />
                      <p className="text-sm font-semibold text-text-primary">{r.risk}</p>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      <span className="font-semibold text-green-600">Mitigation: </span>{r.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
