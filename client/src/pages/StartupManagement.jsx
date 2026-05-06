import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateFRS } from '../utils/calculateFRS';
import { ChevronDown, ChevronUp, UserPlus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StartupManagement() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  async function fetchStartups() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'founder'), where('onboardingComplete', '==', true));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => {
        const profile = { id: d.id, ...d.data() };
        profile.frs = calculateFRS(profile);
        return profile;
      });
      // Sort desc by FRS
      data.sort((a, b) => b.frs - a.frs);
      setStartups(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch startups.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStartups();
  }, []);

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  async function handleAssignMentor(startup) {
    // Mocking the assign mentor functionality as requested for admin
    try {
      await addDoc(collection(db, 'mentorshipRequests'), {
        userId: startup.id,
        mentorId: 'admin_assigned',
        mentorName: 'SEIP Assigned Mentor',
        requestedOn: startup.startupName,
        status: 'Assigned',
        createdAt: new Date().toISOString()
      });
      toast.success(`Mentor assigned to ${startup.startupName}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign mentor.');
    }
  }

  const frsColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
    return 'text-red-600 bg-red-50 border border-red-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Startup Management</h1>
        <p className="text-text-secondary text-sm mt-0.5">Review and manage onboarded startups.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading startups...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-5 py-4 w-10"></th>
                  <th className="px-5 py-4">Startup Name</th>
                  <th className="px-5 py-4">Founder</th>
                  <th className="px-5 py-4">Industry</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">FRS</th>
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {startups.map(startup => (
                  <React.Fragment key={startup.id}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedId === startup.id ? 'bg-slate-50/50' : ''}`}
                      onClick={() => toggleExpand(startup.id)}
                    >
                      <td className="px-5 py-4 text-slate-400">
                        {expandedId === startup.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-5 py-4 font-bold text-text-primary flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-400" />
                        {startup.startupName}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">{startup.fullName}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wide">
                          {startup.industry}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-medium">{startup.stage}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${frsColor(startup.frs)}`}>
                          {startup.frs}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{startup.teamSize}</td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAssignMentor(startup); }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <UserPlus size={14} /> Assign Mentor
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Content */}
                    {expandedId === startup.id && (
                      <tr className="bg-slate-50/30">
                        <td colSpan="8" className="p-0 border-t-0">
                          <div className="px-16 py-6 pb-8 border-b border-slate-100 grid grid-cols-2 gap-8 fade-in">
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                              <p className="text-sm text-text-secondary leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                {startup.description || 'Not provided'}
                              </p>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Addressed</h4>
                                <p className="text-sm text-text-primary">{startup.problem || 'Not provided'}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Audience</h4>
                                  <p className="text-sm text-text-primary">{startup.targetAudience || 'Not provided'}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue Model</h4>
                                  <p className="text-sm text-text-primary">{startup.revenueModel || 'Not provided'}</p>
                                </div>
                              </div>
                              {startup.website && (
                                <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Website</h4>
                                  <a href={startup.website} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{startup.website}</a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {startups.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-slate-500">No onboarded startups found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
