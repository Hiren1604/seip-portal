import { useState, useEffect } from 'react';
import { Search, X, Eye, Trash2, ShieldAlert } from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateFRS } from '../utils/calculateFRS';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal
  const [selectedUser, setSelectedUser] = useState(null);

  async function fetchUsers() {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => {
        const profile = { id: d.id, ...d.data() };
        if (profile.role === 'founder' && profile.onboardingComplete) {
          profile.frs = calculateFRS(profile);
        }
        return profile;
      });
      // Sort newest first
      data.sort((a, b) => {
        const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bT - aT;
      });
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(u => u.fullName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
    }
    if (roleFilter !== 'All') {
      result = result.filter(u => u.role === roleFilter.toLowerCase());
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  async function handleDelete(userId) {
    if (!window.confirm('Are you sure you want to soft-delete this user? They will lose platform access.')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'deleted' });
      toast.success('User marked as deleted.');
      fetchUsers(); // refresh
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user.');
    }
  }

  const roleColor = (role) => {
    if (role === 'founder') return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    if (role === 'investor') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (role === 'admin') return 'bg-rose-50 text-rose-600 border-rose-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
        <p className="text-text-secondary text-sm mt-0.5">Manage platform accounts and roles.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 h-10 py-1"
          />
        </div>
        
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field h-10 py-1 w-auto min-w-[140px] appearance-none">
          <option value="All">All Roles</option>
          <option value="founder">Founder</option>
          <option value="investor">Investor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Startup Info</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${user.status === 'deleted' ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{user.fullName || '—'}</span>
                        {user.status === 'deleted' && <ShieldAlert size={14} className="text-red-500" title="Deleted" />}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${roleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.role === 'founder' ? (
                        <div>
                          <p className="font-semibold text-text-primary">{user.startupName || 'Not Set'}</p>
                          <p className="text-[10px] text-slate-400">FRS: {user.frs ? user.frs : 'N/A'}</p>
                        </div>
                      ) : <span className="text-slate-400 text-xs italic">N/A</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedUser(user)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View Profile">
                          <Eye size={16} />
                        </button>
                        {user.status !== 'deleted' && user.role !== 'admin' && (
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-text-primary">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${roleColor(selectedUser.role).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}>
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{selectedUser.fullName || 'Unnamed'}</h3>
                  <p className="text-sm text-text-secondary">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                  <p className="font-medium text-text-primary capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="font-medium text-text-primary capitalize">{selectedUser.status || 'Active'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Joined</p>
                  <p className="font-medium text-text-primary">
                    {selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ID</p>
                  <p className="font-mono text-xs text-text-secondary truncate">{selectedUser.id}</p>
                </div>
              </div>

              {selectedUser.role === 'founder' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-text-primary mb-3">Startup Info</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Startup Name</p>
                      <p className="font-medium text-text-primary">{selectedUser.startupName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Industry</p>
                      <p className="font-medium text-text-primary">{selectedUser.industry || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stage</p>
                      <p className="font-medium text-text-primary">{selectedUser.stage || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Onboarding</p>
                      <p className="font-medium text-text-primary">{selectedUser.onboardingComplete ? 'Complete ✓' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
