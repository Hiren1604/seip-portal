import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [role, setRole] = useState('founder');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const userCredential = await register(form.email, form.password);
      
      // Save initial user doc with role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: form.fullName,
        email: form.email,
        role: role,
        createdAt: serverTimestamp(),
        approved: false,
        onboardingComplete: false
      });

      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email already in use. Try logging in.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 mb-3">
              <Rocket size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
            <p className="text-text-secondary text-sm mt-1">Join AI Startup Ecosphere today</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                type="button" 
                onClick={() => setRole('founder')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  role === 'founder' ? 'border-primary bg-indigo-50 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                I am a Founder
              </button>
              <button 
                type="button" 
                onClick={() => setRole('investor')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  role === 'investor' ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                I am an Investor
              </button>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" required placeholder="John Doe" {...field('fullName')} className="input-field pl-9" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required placeholder="you@example.com" {...field('email')} className="input-field pl-9" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required placeholder="Min. 6 characters" {...field('password')}
                  className="input-field pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required placeholder="Re-enter password" {...field('confirm')} className="input-field pl-9" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <span className="spinner !w-5 !h-5 !border-2" /> : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
