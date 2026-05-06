import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 19000 },
  { month: 'Mar', revenue: 25000 },
  { month: 'Apr', revenue: 32000 },
  { month: 'May', revenue: 48000 },
  { month: 'Jun', revenue: 65000 },
];

const apiUsageData = [
  { day: 'Mon', requests: 4000, errors: 24 },
  { day: 'Tue', requests: 3000, errors: 13 },
  { day: 'Wed', requests: 5500, errors: 45 },
  { day: 'Thu', requests: 4800, errors: 30 },
  { day: 'Fri', requests: 6200, errors: 50 },
  { day: 'Sat', requests: 8000, errors: 80 },
  { day: 'Sun', requests: 7500, errors: 65 },
];

export default function Performance() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Performance Metrics</h1>
          <p className="text-text-secondary text-sm mt-0.5">Track your startup's growth and operational health.</p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm">Download Report</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: '$65,000', delta: '+35%', icon: DollarSign, color: 'text-green-600 bg-green-100' },
          { label: 'Active Users', value: '12.4k', delta: '+12%', icon: Users, color: 'text-blue-600 bg-blue-100' },
          { label: 'Avg. Response Time', value: '142ms', delta: '-15ms', icon: Activity, color: 'text-purple-600 bg-purple-100' },
          { label: 'Conversion Rate', value: '4.8%', delta: '+0.4%', icon: TrendingUp, color: 'text-orange-600 bg-orange-100' },
        ].map(({ label, value, delta, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-card border border-slate-50 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <div className="flex items-end gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800 leading-none">{value}</span>
                <span className="text-[10px] font-bold text-green-500 mb-0.5">{delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-50">
          <p className="font-bold text-slate-800 text-sm mb-6">Revenue Growth (H1)</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* API Usage Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-50">
          <p className="font-bold text-slate-800 text-sm mb-6">API Traffic (This Week)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={apiUsageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="requests" name="Total Requests" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="errors" name="Errors" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
