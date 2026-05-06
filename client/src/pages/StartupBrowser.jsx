import { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowRight, TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { calculateFRS } from '../utils/calculateFRS';
import toast from 'react-hot-toast';

export default function StartupBrowser() {
  const { currentUser } = useAuth();
  
  const [startups, setStartups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [stage, setStage] = useState('All');
  const [frsFilter, setFrsFilter] = useState('Any'); // 'Any', '70+', '50-70', 'Below 50'
  
  // Modal
  const [selectedStartup, setSelectedStartup] = useState(null);

  useEffect(() => {
    async function fetchStartups() {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'founder'), where('onboardingComplete', '==', true));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => {
          const profile = { id: doc.id, ...doc.data() };
          profile.frs = calculateFRS(profile);
          return profile;
        });
        setStartups(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStartups();
  }, []);

  useEffect(() => {
    let result = startups;
    if (search) {
      result = result.filter(s => s.startupName?.toLowerCase().includes(search.toLowerCase()) || s.fullName?.toLowerCase().includes(search.toLowerCase()));
    }
    if (industry !== 'All') {
      result = result.filter(s => s.industry === industry);
    }
    if (stage !== 'All') {
      result = result.filter(s => s.stage === stage);
    }
    if (frsFilter !== 'Any') {
      if (frsFilter === '70+') result = result.filter(s => s.frs >= 70);
      else if (frsFilter === '50-70') result = result.filter(s => s.frs >= 50 && s.frs < 70);
      else if (frsFilter === 'Below 50') result = result.filter(s => s.frs < 50);
    }
    setFiltered(result);
  }, [search, industry, stage, frsFilter, startups]);

  function resetFilters() {
    setSearch('');
    setIndustry('All');
    setStage('All');
    setFrsFilter('Any');
  }

  async function handleExpressInterest(startup) {
    try {
      await addDoc(collection(db, 'investorInterest'), {
        investorId: currentUser.uid,
        founderId: startup.id,
        startupName: startup.startupName,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      toast.success(`Interest expressed in ${startup.startupName}!`);
    } catch (err) {
      toast.error('Failed to express interest.');
    }
  }

  const frsColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Browse Startups</h1>
        <p className="text-text-secondary text-sm mt-0.5">Discover and connect with high-potential founders.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 h-10 py-1"
          />
        </div>
        
        <select value={industry} onChange={e => setIndustry(e.target.value)} className="input-field h-10 py-1 w-auto min-w-[140px] appearance-none">
          <option value="All">All Industries</option>
          {['FinTech','HealthTech','EdTech','AI/ML','AgriTech','CleanTech','Other'].map(i=><option key={i}>{i}</option>)}
        </select>

        <select value={stage} onChange={e => setStage(e.target.value)} className="input-field h-10 py-1 w-auto min-w-[120px] appearance-none">
          <option value="All">All Stages</option>
          {['Idea','MVP','Growth','Scale'].map(s=><option key={s}>{s}</option>)}
        </select>

        <select value={frsFilter} onChange={e => setFrsFilter(e.target.value)} className="input-field h-10 py-1 w-auto min-w-[140px] appearance-none">
          <option value="Any">Any FRS Score</option>
          <option value="70+">70+ (High)</option>
          <option value="50-70">50 - 70 (Medium)</option>
          <option value="Below 50">Below 50 (Low)</option>
        </select>

        <button onClick={resetFilters} className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
          <X size={14} /> Reset
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">Loading startups...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-100">No startups match your filters.</div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {filtered.map(startup => (
            <div key={startup.id} className="bg-white rounded-2xl shadow-card p-6 border border-slate-100 hover:border-indigo-100 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1.5">{startup.startupName}</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-primary text-[10px] font-bold uppercase tracking-wide">{startup.industry}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">{startup.stage}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="text-sm">
                      <p className="font-semibold text-text-primary">{startup.fullName}</p>
                      <p className="text-[10px] text-text-secondary">Founder</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                      {startup.fullName ? startup.fullName.charAt(0) : 'U'}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
                  {startup.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[10px] font-semibold text-text-secondary uppercase mb-1">Funding Readiness</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${frsColor(startup.frs)}`} style={{ width: `${Math.max(startup.frs, 5)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-text-primary w-6 text-right">{startup.frs}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-text-secondary uppercase mb-0.5">Team Size</p>
                      <p className="text-sm font-bold text-text-primary">{startup.teamSize || '1'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-text-secondary uppercase mb-0.5">Revenue Model</p>
                      <p className="text-[11px] font-bold text-text-primary truncate max-w-[80px]">{startup.revenueModel || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedStartup(startup)}
                  className="flex-1 py-2.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleExpressInterest(startup)}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 shadow-md shadow-primary/20 transition-all"
                >
                  Express Interest
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col fade-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {selectedStartup.startupName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary leading-tight">{selectedStartup.startupName}</h2>
                  <p className="text-xs text-text-secondary font-medium">Founder: {selectedStartup.fullName} • {selectedStartup.country}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStartup(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* Top Highlights */}
              <div className="flex gap-3 mb-8">
                <div className="px-3 py-1.5 bg-indigo-50 text-primary text-xs font-bold rounded-lg">{selectedStartup.industry}</div>
                <div className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">Stage: {selectedStartup.stage}</div>
                <div className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">Team: {selectedStartup.teamSize}</div>
                {selectedStartup.website && (
                  <a href={selectedStartup.website} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:underline">
                    Website ↗
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary"/> The Vision
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed bg-slate-50 p-4 rounded-xl">
                      {selectedStartup.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary mb-2">Problem Addressed</h4>
                    <p className="text-sm text-text-secondary leading-relaxed bg-slate-50 p-4 rounded-xl">
                      {selectedStartup.problem || 'Not specified'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary mb-2">Target Audience</h4>
                      <p className="text-sm text-text-secondary">{selectedStartup.targetAudience || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary mb-2">Revenue Model</h4>
                      <p className="text-sm text-text-secondary">{selectedStartup.revenueModel || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Right Col (FRS Breakdown) */}
                <div className="col-span-1">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 blur-2xl rounded-full pointer-events-none" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Readiness Score</p>
                    <div className="flex items-end gap-2 mb-6 relative z-10">
                      <span className="text-5xl font-black">{selectedStartup.frs}</span>
                      <span className="text-slate-400 mb-1 font-medium">/ 100</span>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                          <span className="text-slate-300">Financial Maturity</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-indigo-400 rounded-full w-3/4" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                          <span className="text-slate-300">Market Validation</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-green-400 rounded-full w-2/3" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                          <span className="text-slate-300">Compliance & Docs</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-yellow-400 rounded-full w-full" /></div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        handleExpressInterest(selectedStartup);
                        setSelectedStartup(null);
                      }}
                      className="w-full mt-8 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
                    >
                      Express Interest
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
