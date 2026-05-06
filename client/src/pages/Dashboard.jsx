import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  Building2, Zap, DollarSign, TrendingUp, Sparkles, Clock,
  CheckCircle2, Circle, AlertCircle, UserCheck, FlaskConical,
  BarChart3, ShieldCheck, BookOpen, ArrowRight, ArrowUpRight, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateFRS } from '../utils/calculateFRS';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const chartData = [
  { month: 'Jan', startups: 28 },
  { month: 'Feb', startups: 38 },
  { month: 'Mar', startups: 45 },
  { month: 'Apr', startups: 52 },
  { month: 'May', startups: 65 },
  { month: 'Jun', startups: 88 },
];

const activities = [
  { text: 'Performance report generated for Q2 2024',    time: '1 hour ago',  color: 'bg-blue-100 text-blue-600'   },
  { text: 'Compliance checklist updated successfully',   time: '2 hours ago', color: 'bg-orange-100 text-orange-600'},
  { text: 'Sandbox environment created for your project', time: '3 hours ago', color: 'bg-purple-100 text-purple-600'},
];

const quickAccess = [
  { label: 'My Startup',  icon: UserCheck,  color: 'bg-purple-100 text-purple-600', path: '/founder/onboarding' },
  { label: 'Mentorship',  icon: Building2,  color: 'bg-green-100 text-green-600',   path: '/founder/mentorship' },
  { label: 'Sandbox',     icon: FlaskConical,color: 'bg-blue-100 text-blue-600',    path: '/founder/sandbox'          },
  { label: 'Performance', icon: BarChart3,  color: 'bg-orange-100 text-orange-600', path: '/founder/performance'      },
  { label: 'Compliance',  icon: ShieldCheck,color: 'bg-red-100 text-red-600',       path: '/founder/compliance'       },
  { label: 'Resources',   icon: BookOpen,   color: 'bg-indigo-100 text-indigo-600', path: '/founder/resources'        },
];

// SVG gauge
function ArcGauge({ pct }) {
  const r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width="140" height="140" className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [mentorshipCount, setMentorshipCount] = useState(0);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      try {
        // Fetch mentorship requests
        const q = query(collection(db, 'mentorshipRequests'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        setMentorshipCount(snap.size);

        // Fetch mentors from API
        const res = await fetch('http://localhost:5000/api/mentors');
        const data = await res.json();
        setMentors(data.slice(0, 3)); // show top 3
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    }
    fetchData();
  }, [currentUser]);

  // Calculations
  const onboardingComplete = userProfile?.onboardingComplete || false;
  
  // Profile completion % (count fields filled out of expected fields)
  const expectedFields = ['fullName', 'phone', 'country', 'role', 'startupName', 'industry', 'stage', 'teamSize', 'description', 'problem', 'targetAudience', 'revenueModel'];
  const filledFields = expectedFields.filter(f => userProfile && userProfile[f] && userProfile[f].toString().trim() !== '');
  const completionPct = Math.round((filledFields.length / expectedFields.length) * 100) || 0;

  const frs = calculateFRS(userProfile);

  const tasks = [
    { text: 'Complete Business Profile', due: '25 May 2024', status: onboardingComplete ? 'done' : 'active' },
    { text: 'AI Idea Evaluation',        due: '28 May 2024', status: 'pending' },
    { text: 'Compliance Verification',   due: '30 May 2024', status: 'pending'},
  ];
  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;

  const stats = [
    { label: 'Profile Completion',  value: `${completionPct}%`, delta: onboardingComplete ? 'Complete' : 'Needs attention', icon: UserCheck,  color: 'bg-purple-100 text-purple-600' },
    { label: 'Mentorship Sessions', value: mentorshipCount,     delta: 'Active requests',  icon: Users,         color: 'bg-green-100 text-green-600'  },
    { label: 'Readiness Score',     value: frs > 0 ? frs : '—', delta: 'Out of 100', icon: TrendingUp,  color: 'bg-blue-100 text-blue-600'    },
    { label: 'Tasks Pending',       value: pendingTasksCount,   delta: 'Action required', icon: Clock,  color: 'bg-orange-100 text-orange-600' },
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

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Chart */}
        <div className="col-span-1 bg-white rounded-2xl shadow-card p-5" style={{gridColumn:'span 1'}}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-text-primary text-sm">Startup Growth Overview</p>
            <span className="text-xs text-text-secondary border border-slate-200 rounded-lg px-2.5 py-1 font-medium">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="indigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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

        {/* AI Insight (FRS) */}
        <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3 self-start">
            <Sparkles size={16} className="text-primary" />
            <p className="font-bold text-text-primary text-sm">AI Insight</p>
          </div>
          <div className="relative">
            <ArcGauge pct={frs} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-text-primary">{frs}</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-text-primary mt-2">Funding Readiness Score</p>
          <p className="text-[11px] text-text-secondary mt-1">Based on your stage, team, and metrics.</p>
        </div>

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
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
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
