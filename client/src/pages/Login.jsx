import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('founder');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await login(form.email, form.password);
      
      // Verify Role
      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      let actualRole = 'founder';
      if (docSnap.exists() && docSnap.data().role) {
        actualRole = docSnap.data().role.toLowerCase();
      }
      
      if (actualRole !== role) {
        await logout();
        setError('Invalid role selected for this account.');
        setLoading(false);
        return;
      }

      toast.success('Welcome back! 🚀');
      if (role === 'investor') navigate('/investor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/founder/dashboard');
      
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 mb-3">
              <Rocket size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
            <p className="text-text-secondary text-sm mt-1">Sign in to AI Startup Ecosphere</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['founder', 'investor', 'admin'].map(r => (
                <button 
                  key={r}
                  type="button" 
                  onClick={() => setRole(r)}
                  className={`py-2 px-1 rounded-lg border-2 text-[11px] uppercase tracking-wider font-bold transition-all ${
                    role === r 
                      ? (r==='admin' ? 'border-red-500 bg-red-50 text-red-600' : r==='investor' ? 'border-green-500 bg-green-50 text-green-600' : 'border-primary bg-indigo-50 text-primary')
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <span className="spinner !w-5 !h-5 !border-2" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
