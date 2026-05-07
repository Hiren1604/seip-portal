import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Sparkles, Clock, Building2,
  CheckCircle2, Circle, AlertCircle, UserCheck, FlaskConical,
  BarChart3, ShieldCheck, BookOpen, ArrowRight, Users,
  ThumbsUp, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateFRS } from '../utils/calculateFRS';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/* ── Hardcoded AI fallback ───────────────────────────────────────── */
const FALLBACK_INSIGHTS = {
  overallScore: 72,
  scoreLabel: 'Strong Early Traction',
  summary: 'Your startup shows solid fundamentals with a clearly defined problem and a promising target audience. Focus on building traction metrics and refining your revenue model this quarter.',
  nextMilestone: 'Achieve first 100 paying customers and document unit economics before approaching seed-stage investors.',
  strengths: [
    { title: 'Clear Problem Statement', detail: 'Well-defined pain point with measurable market impact.' },
    { title: 'Defined Target Audience', detail: 'Specific and reachable customer segment.' },
  ],
  weaknesses: [
    { title: 'Team Completeness', detail: 'Missing a technical co-founder — a key investor concern at this stage.' },
    { title: 'Traction Evidence', detail: 'No quantified traction data shared yet (MRR, DAU, pilots).' },
  ],
  recommendations: [
    { action: 'Build an MVP within 60 days', priority: 'High', impact: 'Converts your idea into a tangible asset investors can evaluate.' },
    { action: 'Launch a pilot with 10 design-partner customers', priority: 'High', impact: 'Provides social proof and early revenue.' },
  ],
  investorReadiness: { score: 58, tips: ['Prepare a 10-slide pitch deck.', 'Document your cap table and IP ownership.'] },
  marketOpportunity: 'The global addressable market for your sector is estimated at $4.2B by 2028, growing at 18% CAGR.',
  riskFactors: [
    { risk: 'Well-funded competitor entering the space', level: 'High', mitigation: 'Accelerate customer lock-in through integrations.' },
  ],
  actionPlan: [
    { phase: 'Month 1–2', title: 'MVP & Pilot Launch', tasks: ['Finalize MVP scope', 'Sign 5 beta users', 'Set up analytics'] },
  ],
};

const chartData = [
  { month: 'Jan', startups: 28 },
  { month: 'Feb', startups: 38 },
  { month: 'Mar', startups: 45 },
  { month: 'Apr', startups: 52 },
  { month: 'May', startups: 65 },
  { month: 'Jun', startups: 88 },
];

const activities = [
  { text: 'Performance report generated for Q2 2024',     time: '1 hour ago',  color: 'bg-blue-100 text-blue-600'    },
  { text: 'Compliance checklist updated successfully',    time: '2 hours ago', color: 'bg-orange-100 text-orange-600' },
  { text: 'Sandbox environment created for your project', time: '3 hours ago', color: 'bg-purple-100 text-purple-600' },
];

const quickAccess = [
  { label: 'My Startup',  icon: UserCheck,   color: 'bg-purple-100 text-purple-600', path: '/founder/onboarding'   },
  { label: 'Mentorship',  icon: Building2,   color: 'bg-green-100 text-green-600',   path: '/founder/mentorship'   },
  { label: 'Sandbox',     icon: FlaskConical,color: 'bg-blue-100 text-blue-600',     path: '/founder/sandbox'      },
  { label: 'Performance', icon: BarChart3,   color: 'bg-orange-100 text-orange-600', path: '/founder/performance'  },
  { label: 'Compliance',  icon: ShieldCheck, color: 'bg-red-100 text-red-600',       path: '/founder/compliance'   },
  { label: 'Resources',   icon: BookOpen,    color: 'bg-indigo-100 text-indigo-600', path: '/founder/resources'    },
];

function ArcGauge({ pct, color = '#22c55e' }) {
  const r = 38, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width="100" height="100" className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

function ScoreBadge({ score }) {
  const color =
    score >= 75 ? 'bg-green-100 text-green-700' :
    score >= 50 ? 'bg-blue-100 text-blue-700' :
    score >= 30 ? 'bg-orange-100 text-orange-700' :
    'bg-red-100 text-red-700';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}/100
    </span>
  );
}

function PriorityBadge({ priority }) {
  return priority === 'High'
    ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">HIGH</span>
    : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">MED</span>;
}

/* ─── AI Insights Panel ─────────────────────────────────────────── */
function AIInsightsPanel({ userProfile }) {
  const navigate = useNavigate();
  const [insights, setInsights]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!userProfile?.onboardingComplete) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('API error');
      setInsights(data.insights);
      setUsingFallback(false);
    } catch {
      setInsights(FALLBACK_INSIGHTS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.onboardingComplete && !insights && !loading) fetchInsights();
  }, [userProfile?.onboardingComplete]);

  /* ── Not onboarded ── */
  if (!userProfile?.onboardingComplete) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Sparkles size={22} className="text-primary" />
        </div>
        <p className="font-bold text-text-primary text-sm">AI Insights Locked</p>
        <p className="text-xs text-text-secondary max-w-[200px]">
          Complete your startup onboarding to unlock personalized AI insights.
        </p>
        <Link to="/founder/onboarding"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Complete Onboarding <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col items-center justify-center text-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={14} className="text-primary" />
          </div>
        </div>
        <p className="font-bold text-text-primary text-sm">Analyzing your startup…</p>
        <p className="text-[11px] text-text-secondary">Gemini is generating your insights</p>
      </div>
    );
  }

  if (!insights) return null;

  const gaugeColor =
    insights.overallScore >= 75 ? '#22c55e' :
    insights.overallScore >= 50 ? '#6366f1' :
    insights.overallScore >= 30 ? '#f97316' : '#ef4444';

  const topStrengths  = (insights.strengths  || []).slice(0, 2);
  const topWeaknesses = (insights.weaknesses || []).slice(0, 2);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
      {/* gradient strip */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />

      <div className="p-5 flex flex-col flex-1">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <p className="font-bold text-text-primary text-sm">AI Insights</p>
            <span className="text-[9px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
              GEMINI
            </span>
            {usingFallback && (
              <span className="text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">DEMO</span>
            )}
          </div>
          <button onClick={fetchInsights}
            className="text-[10px] text-text-secondary hover:text-primary flex items-center gap-1 transition-colors"
            title="Refresh insights">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        {/* Score row — compact */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="relative shrink-0">
            <ArcGauge pct={insights.overallScore} color={gaugeColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-text-primary">{insights.overallScore}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary">{insights.scoreLabel}</p>
            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed line-clamp-3">
              {insights.summary}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <button
            onClick={() => navigate('/founder/ai-report')}
            className="w-full text-[11px] font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all shadow-sm shadow-indigo-200"
          >
            <Sparkles size={12} /> Open Full AI Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [mentorshipCount, setMentorshipCount] = useState(0);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'mentorshipRequests'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        setMentorshipCount(snap.size);

        const res = await fetch('http://localhost:5000/api/mentors');
        const data = await res.json();
        setMentors(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    }
    fetchData();
  }, [currentUser]);

  const onboardingComplete = userProfile?.onboardingComplete || false;

  const expectedFields = ['fullName', 'phone', 'country', 'role', 'startupName', 'industry', 'stage', 'teamSize', 'description', 'problem', 'targetAudience', 'revenueModel'];
  const filledFields = expectedFields.filter(f => userProfile && userProfile[f] && userProfile[f].toString().trim() !== '');
  const completionPct = Math.round((filledFields.length / expectedFields.length) * 100) || 0;

  const frs = calculateFRS(userProfile);

  const tasks = [
    { text: 'Complete Business Profile', due: '25 May 2024', status: onboardingComplete ? 'done' : 'active' },
    { text: 'AI Idea Evaluation',        due: '28 May 2024', status: 'pending' },
    { text: 'Compliance Verification',   due: '30 May 2024', status: 'pending' },
  ];
  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;

  const stats = [
    { label: 'Profile Completion',  value: `${completionPct}%`, delta: onboardingComplete ? 'Complete' : 'Needs attention', icon: UserCheck,  color: 'bg-purple-100 text-purple-600' },
    { label: 'Mentorship Sessions', value: mentorshipCount,     delta: 'Active requests',  icon: Users,      color: 'bg-green-100 text-green-600'   },
    { label: 'Readiness Score',     value: frs > 0 ? frs : '—', delta: 'Out of 100',      icon: TrendingUp, color: 'bg-blue-100 text-blue-600'     },
    { label: 'Tasks Pending',       value: pendingTasksCount,   delta: 'Action required',  icon: Clock,      color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-0.5">Welcome back, {userProfile?.fullName || 'Founder'}! 👋</p>
      </div>

      {!onboardingComplete && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <p className="text-yellow-800 text-sm font-medium">Complete your startup profile to unlock all features.</p>
          </div>
          <Link to="/founder/onboarding" className="text-sm font-bold text-yellow-700 hover:text-yellow-900 flex items-center gap-1">
            Complete Now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">{label}</p>
              <p className="text-xl font-bold text-text-primary leading-tight">{value}</p>
              <p className={`text-[11px] font-semibold mt-0.5 ${delta === 'Needs attention' || delta === 'Action required' ? 'text-orange-500' : 'text-slate-500'}`}>{delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Chart + AI Insights + Activity */}
      <div className="grid grid-cols-3 gap-5">
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-text-primary text-sm">Startup Growth Overview</p>
            <span className="text-xs text-text-secondary border border-slate-200 rounded-lg px-2.5 py-1 font-medium">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="indigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="startups" name="Active Startups" stroke="#6366f1" strokeWidth={2.5} fill="url(#indigo)" dot={{ r: 3, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel userProfile={userProfile} />

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="font-bold text-text-primary text-sm mb-4">Recent Activity</p>
          <div className="space-y-3">
            {activities.map(({ text, time, color }) => (
              <div key={text} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Clock size={13} />
                </div>
                <div>
                  <p className="text-xs text-text-primary font-medium leading-snug">{text}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Mentor Recommendations */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-text-primary text-sm">Mentor Recommendations</p>
            <button onClick={() => navigate('/founder/mentorship')} className="text-xs text-primary font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {mentors.map(({ name, title, rating, company }) => (
              <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{name}</p>
                  <p className="text-[11px] text-text-secondary truncate">{title} at {company}</p>
                  <p className="text-[11px] text-yellow-500 font-semibold">⭐ {rating}</p>
                </div>
                <button onClick={() => navigate('/founder/mentorship')} className="text-xs text-primary font-semibold hover:underline shrink-0">
                  Request
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="font-bold text-text-primary text-sm mb-4">Upcoming Tasks</p>
          <div className="space-y-3">
            {tasks.map(({ text, due, status }) => (
              <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                {status === 'done'
                  ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  : status === 'active'
                  ? <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                  : <Circle size={18} className="text-slate-300 shrink-0" />
                }
                <div>
                  <p className="text-xs font-semibold text-text-primary">{text}</p>
                  <p className="text-[11px] text-text-secondary">Due: {due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="font-bold text-text-primary text-sm mb-4">Quick Access</p>
          <div className="grid grid-cols-3 gap-2.5">
            {quickAccess.map(({ label, icon: Icon, color, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-semibold text-text-secondary text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
