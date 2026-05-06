import { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileCheck, MessageSquare, Handshake, Eye, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0, founders: 0, investors: 0, onboarded: 0, mentorships: 0, interests: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [sectorData, setSectorData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'));
        let founders = 0, investors = 0, onboarded = 0;
        const allUsers = [];
        const industryCounts = {};

        usersSnap.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          allUsers.push(data);
          
          if (data.role === 'founder') {
            founders++;
            if (data.onboardingComplete) onboarded++;
            if (data.industry) {
              industryCounts[data.industry] = (industryCounts[data.industry] || 0) + 1;
            }
          } else if (data.role === 'investor') {
            investors++;
          }
        });

        // 2. Fetch Mentorship Requests
        const mentSnap = await getDocs(collection(db, 'mentorshipRequests'));
        const mentorships = mentSnap.size;
        const feed = [];
        mentSnap.forEach(doc => {
          const d = doc.data();
          feed.push({ 
            id: doc.id, type: 'mentorship', text: `${d.mentorName} requested by user`, 
            time: d.createdAt ? new Date(d.createdAt).getTime() : 0, 
            dateStr: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Unknown'
          });
        });

        // 3. Fetch Investor Interests
        const intSnap = await getDocs(collection(db, 'investorInterest'));
        const interests = intSnap.size;
        intSnap.forEach(doc => {
          const d = doc.data();
          const t = d.timestamp?.toMillis ? d.timestamp.toMillis() : 0;
          feed.push({
            id: doc.id, type: 'interest', text: `Interest expressed in ${d.startupName}`,
            time: t, dateStr: d.timestamp?.toDate ? d.timestamp.toDate().toLocaleDateString() : 'Unknown'
          });
        });

        // Process Data
        setStats({ totalUsers: allUsers.length, founders, investors, onboarded, mentorships, interests });

        // Sort users desc
        allUsers.sort((a, b) => {
          const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bT - aT;
        });
        setRecentUsers(allUsers.slice(0, 10));

        // Sort feed desc
        feed.sort((a, b) => b.time - a.time);
        setActivityFeed(feed.slice(0, 10));

        // Format Sector Data for BarChart
        const sData = Object.keys(industryCounts).map(key => ({ name: key, count: industryCounts[key] }));
        sData.sort((a, b) => b.count - a.count);
        setSectorData(sData);

      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users',         value: stats.totalUsers,  icon: Users,         color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Founders',            value: stats.founders,    icon: Building2,     color: 'bg-purple-100 text-purple-600' },
    { label: 'Investors',           value: stats.investors,   icon: Briefcase,     color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Startups Onboarded',  value: stats.onboarded,   icon: FileCheck,     color: 'bg-blue-100 text-blue-600' },
    { label: 'Mentorship Requests', value: stats.mentorships, icon: MessageSquare, color: 'bg-orange-100 text-orange-600' },
    { label: 'Investor Interests',  value: stats.interests,   icon: Handshake,     color: 'bg-rose-100 text-rose-600' },
  ];

  const roleColor = (role) => {
    if (role === 'founder') return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    if (role === 'investor') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (role === 'admin') return 'bg-rose-50 text-rose-600 border-rose-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Control Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Control Panel</h1>
          <p className="text-text-secondary text-sm mt-0.5">{currentDate}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-text-primary leading-tight">{value}</p>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Col: Users Table */}
        <div className="col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-text-primary text-base">Recent User Registrations</h2>
            <button onClick={() => navigate('/admin/users')} className="text-xs text-indigo-600 font-bold hover:underline">View All Users</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {recentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-text-primary">{user.fullName || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${roleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-5 py-3">
                      {user.role === 'founder' ? (
                        <span className={`text-[11px] font-bold ${user.onboardingComplete ? 'text-emerald-500' : 'text-orange-400'}`}>
                          {user.onboardingComplete ? 'Onboarded' : 'Pending'}
                        </span>
                      ) : <span className="text-[11px] text-slate-400 font-medium">N/A</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => navigate('/admin/users')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentUsers.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No users found.</p>}
          </div>
        </div>

        {/* Right Col: Activity Feed */}
        <div className="col-span-1 bg-white rounded-2xl shadow-card border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Activity size={18} className="text-indigo-600"/>
            <h2 className="font-bold text-text-primary text-base">Platform Activity Feed</h2>
          </div>
          <div className="p-5 overflow-y-auto max-h-[400px] space-y-4">
            {activityFeed.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.type === 'interest' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                <div>
                  <p className="text-sm font-medium text-text-primary leading-snug">{item.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.dateStr}</p>
                </div>
              </div>
            ))}
            {activityFeed.length === 0 && <p className="text-sm text-slate-500 italic">No recent activity.</p>}
          </div>
        </div>
      </div>

      {/* Bottom: Sector Distribution Chart */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
        <h2 className="font-bold text-text-primary text-sm mb-4">Sector Distribution (Startups)</h2>
        {sectorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 text-center py-10">No sector data available.</p>
        )}
      </div>

    </div>
  );
}
