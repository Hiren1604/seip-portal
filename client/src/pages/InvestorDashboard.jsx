import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, TrendingUp, PieChart as PieChartIcon, ArrowRight, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { calculateFRS } from '../utils/calculateFRS';
import toast from 'react-hot-toast';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [totalStartups, setTotalStartups] = useState(0);
  const [avgFrs, setAvgFrs] = useState(0);
  const [sectors, setSectors] = useState(0);
  
  const [topStartups, setTopStartups] = useState([]);
  const [recentStartups, setRecentStartups] = useState([]);
  const [sectorData, setSectorData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRef = collection(db, 'users');
        const foundersQ = query(usersRef, where('role', '==', 'founder'));
        const foundersSnap = await getDocs(foundersQ);
        
        let total = 0;
        let frsSum = 0;
        let frsCount = 0;
        const industryCounts = {};
        const allFounders = [];

        foundersSnap.forEach(doc => {
          total++;
          const data = { id: doc.id, ...doc.data() };
          allFounders.push(data);
          
          if (data.onboardingComplete) {
            const frs = calculateFRS(data);
            frsSum += frs;
            frsCount++;
            data.frs = frs;
            
            if (data.industry) {
              industryCounts[data.industry] = (industryCounts[data.industry] || 0) + 1;
            }
          }
        });

        setTotalStartups(total);
        setAvgFrs(frsCount > 0 ? Math.round(frsSum / frsCount) : 0);
        setSectors(Object.keys(industryCounts).length);

        // Prepare pie chart data
        const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        const pData = Object.keys(industryCounts).map((key, i) => ({
          name: key,
          value: industryCounts[key],
          color: COLORS[i % COLORS.length]
        }));
        setSectorData(pData);

        // Top 3 Startups
        const onboarded = allFounders.filter(f => f.onboardingComplete);
        onboarded.sort((a, b) => (b.frs || 0) - (a.frs || 0));
        setTopStartups(onboarded.slice(0, 3));

        // Recent Startups
        allFounders.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });
        setRecentStartups(allFounders.slice(0, 3));

      } catch (err) {
        console.error("Failed to fetch investor data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleExpressInterest(founder) {
    try {
      await addDoc(collection(db, 'investorInterest'), {
        investorId: currentUser.uid,
        founderId: founder.id,
        startupName: founder.startupName,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      toast.success(`Interest expressed in ${founder.startupName}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to express interest.');
    }
  }

  const stats = [
    { label: 'Total Startups Listed', value: totalStartups, icon: Building2, color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Deals',          value: 3,             icon: Briefcase, color: 'bg-green-100 text-green-600' },
    { label: 'Avg Funding Readiness', value: `${avgFrs}/100`,icon: TrendingUp,color: 'bg-blue-100 text-blue-600' },
    { label: 'Sectors Covered',       value: sectors,       icon: PieChartIcon, color: 'bg-orange-100 text-orange-600' },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Investor Dashboard</h1>
        <p className="text-text-secondary text-sm mt-0.5">Welcome, Investor! Here's your ecosystem overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">{label}</p>
              <p className="text-xl font-bold text-text-primary leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Top Startups */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-text-primary text-base">Top Startups by Readiness Score</p>
            <button onClick={() => navigate('/investor/startups')} className="text-sm text-primary font-semibold hover:underline">
              View All Startups
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {topStartups.map(startup => (
              <div key={startup.id} className="bg-white rounded-2xl shadow-card p-5 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-text-primary">{startup.startupName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-primary text-[10px] font-bold uppercase tracking-wide">{startup.industry}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">{startup.stage}</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">Founder: {startup.fullName} • Team: {startup.teamSize}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${startup.frs}%` }} />
                    </div>
                    <span className="text-xs font-bold text-green-600">FRS: {startup.frs}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors">
                    View Full Profile
                  </button>
                  <button onClick={() => handleExpressInterest(startup)} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 shadow-lg shadow-primary/30 transition-all">
                    Express Interest
                  </button>
                </div>
              </div>
            ))}
            {topStartups.length === 0 && <p className="text-sm text-slate-500 italic py-4">No onboarded startups found yet.</p>}
          </div>
        </div>

        {/* Right Sidebar: Sector Distribution */}
        <div className="col-span-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="font-bold text-text-primary text-sm mb-4">Sector Distribution</p>
            {sectorData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {sectorData.map(s => (
                    <div key={s.name} className="flex items-center gap-1.5 w-[45%]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[11px] text-text-secondary truncate">{s.name} ({s.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Not enough data</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Startups */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <p className="font-bold text-text-primary text-sm mb-4">Recent Startup Registrations</p>
        <div className="grid grid-cols-3 gap-4">
          {recentStartups.map(startup => (
            <div key={startup.id} className="p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary font-bold shrink-0">
                  {startup.startupName ? startup.startupName.charAt(0) : <UserCheck size={18}/>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{startup.startupName || 'Unnamed Startup'}</h4>
                  <p className="text-[11px] text-text-secondary">Joined {startup.createdAt?.toDate ? startup.createdAt.toDate().toLocaleDateString() : 'Recently'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {startup.industry && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-semibold">{startup.industry}</span>}
                {startup.stage && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-semibold">{startup.stage}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
