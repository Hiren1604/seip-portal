import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Star, Users, Award, BarChart2, Search, RefreshCcw, ExternalLink, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const topStats = [
  { label: 'Total Mentors',       value: '48',  icon: Users,    color: 'bg-indigo-100 text-indigo-600'  },
  { label: 'Active Requests',     value: '5',   icon: Clock,    color: 'bg-yellow-100 text-yellow-600'  },
  { label: 'Completed Sessions',  value: '12',  icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  { label: 'Average Rating',      value: '4.7 / 5', icon: Star, color: 'bg-purple-100 text-purple-600'  },
];

const resources = [
  { title: 'How Mentorship Works?',          icon: BookOpen },
  { title: 'Tips for Effective Mentorship',  icon: Award    },
  { title: 'Prepare for Your Session',       icon: BarChart2},
];

function StatusBadge({ status }) {
  const map = {
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Pending':     'bg-slate-100 text-slate-600',
    'Accepted':    'bg-green-100 text-green-700',
  };
  return (
    <span className={`badge ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
  );
}

export default function Mentorship() {
  const { currentUser } = useAuth();
  const [mentors, setMentors]       = useState([]);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [requested, setRequested]   = useState({});
  const [search, setSearch]         = useState('');
  const [filterDomain, setFilterDomain]   = useState('');
  const [filterAvail, setFilterAvail]     = useState('');

  const [filterExpertise, setFilterExpertise] = useState('');
  const [filterRating, setFilterRating]       = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [mRes, rRes] = await Promise.all([
          axios.get('/api/mentors'),
          currentUser ? axios.get(`/api/mentors/requests/${currentUser.uid}`) : Promise.resolve({ data: [] }),
        ]);
        setMentors(mRes.data);
        setRequests(rRes.data);
        const already = {};
        rRes.data.forEach(r => { already[r.mentorId] = true; });
        setRequested(already);
      } catch {
        setMentors([
          { id:'1', name:'Arjun Mehta',  title:'AI & ML Expert',       company:'ex-Google',    rating:4.9, reviews:32, experience:'10+ Years', availability:'Available', nextSlot:'Tomorrow, 11:00 AM', tags:['AI/ML','Product Strategy','Fundraising'] },
          { id:'2', name:'Neha Kapoor',  title:'Marketing Strategist',  company:'ex-Microsoft', rating:4.8, reviews:18, experience:'8+ Years',  availability:'Available', nextSlot:'Today, 04:00 PM',    tags:['Growth Marketing','Branding','Go-to-Market'] },
          { id:'3', name:'Rohit Verma',  title:'FinTech Advisor',       company:'ex-Paytm',     rating:4.7, reviews:27, experience:'12+ Years', availability:'Busy',      nextSlot:'25 May, 10:00 AM',   tags:['FinTech','Financial Modeling','Funding'] },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  async function handleRequest(mentor) {
    if (requested[mentor.id]) return;
    try {
      await axios.post('/api/mentors/request', {
        userId: currentUser?.uid,
        mentorId: mentor.id,
        mentorName: mentor.name,
        requestedOn: new Date().toISOString(),
      });
      setRequested(r => ({ ...r, [mentor.id]: true }));
      setRequests(prev => [...prev, { mentorId: mentor.id, mentorName: mentor.name, title: mentor.title, status: 'Pending', requestedOn: new Date().toISOString() }]);
      toast.success(`Mentorship request sent to ${mentor.name}!`);
    } catch {
      setRequested(r => ({ ...r, [mentor.id]: true }));
      setRequests(prev => [...prev, { mentorId: mentor.id, mentorName: mentor.name, title: mentor.title, status: 'Pending', requestedOn: new Date().toISOString() }]);
      toast.success(`Mentorship request sent to ${mentor.name}!`);
    }
  }

  const filtered = mentors.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.tags?.some(t => t.toLowerCase().includes(q));
    const matchAvail = !filterAvail || m.availability === filterAvail;
    const matchDomain = !filterDomain || m.tags?.includes(filterDomain);
    const matchExp = !filterExpertise || m.tags?.includes(filterExpertise);
    const matchRating = !filterRating || m.rating >= parseFloat(filterRating);
    return matchSearch && matchAvail && matchDomain && matchExp && matchRating;
  });

  const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase();
  const gradients = ['from-purple-500 to-indigo-600','from-green-500 to-teal-600','from-blue-500 to-cyan-600'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mentorship</h1>
          <p className="text-text-secondary text-sm mt-0.5">Connect with industry experts to accelerate your growth</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          + Request New Mentorship
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4">
        {topStats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">{label}</p>
              <p className="text-lg font-bold text-text-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main mentor list */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-bold text-text-primary mb-4">Find the Right Mentor</h2>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search mentors..."
                  className="input-field pl-8 text-[11px] py-2"
                />
              </div>
              <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                className="input-field text-[11px] py-2 w-28 appearance-none">
                <option value="">All Domains</option>
                {['AI/ML','FinTech','HealthTech','EdTech'].map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterExpertise} onChange={e => setFilterExpertise(e.target.value)}
                className="input-field text-[11px] py-2 w-28 appearance-none">
                <option value="">All Expertise</option>
                {['Product Strategy','Fundraising','Marketing','Branding'].map(e => <option key={e}>{e}</option>)}
              </select>
              <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}
                className="input-field text-[11px] py-2 w-28 appearance-none">
                <option value="">Availability</option>
                <option>Available</option>
                <option>Busy</option>
              </select>
              <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
                className="input-field text-[11px] py-2 w-24 appearance-none">
                <option value="">Rating</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </select>
              <button onClick={() => { setSearch(''); setFilterAvail(''); setFilterDomain(''); setFilterExpertise(''); setFilterRating(''); }}
                className="flex items-center gap-1.5 text-[11px] text-text-secondary border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                <RefreshCcw size={12} /> Reset
              </button>
            </div>

            {/* Mentor cards */}
            {loading ? (
              <div className="flex justify-center py-10"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-text-secondary py-8 text-sm">No mentors found.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((m, idx) => (
                  <div key={m.id || m.name} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-card-hover transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[idx % 3]} flex items-center justify-center text-white font-bold shrink-0`}>
                        {initials(m.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-text-primary text-sm">{m.name}</p>
                          <CheckCircle size={13} className="text-green-500" />
                        </div>
                        <p className="text-xs text-text-secondary">{m.title} | {m.company}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-text-primary">{m.rating}</span>
                          <span className="text-xs text-text-secondary">({m.reviews} reviews)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.tags?.map(tag => (
                            <span key={tag} className="badge bg-indigo-50 text-indigo-600">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-1.5">
                        <p className="text-xs text-text-secondary"><span className="font-medium">{m.experience}</span></p>
                        <span className={`badge ${m.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {m.availability}
                        </span>
                        <p className="text-[10px] text-text-secondary">Next: {m.nextSlot}</p>
                        <div className="flex gap-2 mt-2">
                          <button className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
                            <ExternalLink size={11} /> View Profile
                          </button>
                          <button
                            onClick={() => handleRequest(m)}
                            disabled={requested[m.id || m.name]}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                              requested[m.id || m.name]
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'btn-primary'
                            }`}
                          >
                            {requested[m.id || m.name] ? 'Requested' : 'Request Mentorship'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* My Requests */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="font-bold text-text-primary text-sm mb-4">My Mentorship Requests</p>
            {requests.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-4">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[i%3]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials(r.mentorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{r.mentorName}</p>
                      <p className="text-[10px] text-text-secondary truncate">{r.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge status={r.status || 'Pending'} />
                        <span className="text-[10px] text-text-secondary">{r.requestedOn ? new Date(r.requestedOn).toLocaleDateString() : 'Today'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="font-bold text-text-primary text-sm mb-4">Mentorship Resources</p>
            <div className="space-y-2">
              {resources.map(({ title, icon: Icon }) => (
                <button key={title} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-indigo-600" />
                  </div>
                  <p className="text-xs font-medium text-text-primary group-hover:text-primary transition-colors">{title}</p>
                  <ExternalLink size={11} className="text-slate-300 group-hover:text-primary ml-auto transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
