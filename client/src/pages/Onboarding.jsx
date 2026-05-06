import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Circle, Clock, ChevronRight, Rocket, Target, Users, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const STEPS = ['Basic Information', 'Startup Details', 'Idea & Vision'];

function StepCircle({ idx, current }) {
  const done = idx < current;
  const active = idx === current;
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
        ${done ? 'bg-primary border-primary text-white' : active ? 'bg-white border-primary text-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-400'}`}>
        {done ? <CheckCircle2 size={18} className="text-white" /> : idx + 1}
      </div>
      <p className={`text-[11px] font-medium mt-1.5 text-center w-20 ${active ? 'text-primary' : done ? 'text-slate-500' : 'text-slate-400'}`}>
        {STEPS[idx]}
      </p>
    </div>
  );
}

export default function Onboarding() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '', email: currentUser?.email || '', phone: '', country: '', role: '', language: '',
    startupName: '', industry: '', stage: '', teamSize: '', website: '',
    description: '', problem: '', targetAudience: '', revenueModel: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch existing profile data if available
  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm(f => ({ ...f, ...data }));
        if (data.onboardingComplete) setStep(2); // Skip to the end if done
      }
    }
    loadData();
  }, [currentUser]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  function validate() {
    if (step === 0) return form.fullName && form.phone && form.country && form.role;
    if (step === 1) return form.startupName && form.industry && form.stage && form.teamSize;
    if (step === 2) return form.description && form.problem && form.targetAudience && form.revenueModel;
    return true;
  }

  async function saveToFirestore(extra = {}) {
    if (!currentUser) return;
    await setDoc(doc(db, 'users', currentUser.uid), {
      ...form, teamSize: Number(form.teamSize), ...extra, createdAt: serverTimestamp(),
    }, { merge: true });
  }

  async function handleNext() {
    if (!validate()) { toast.error('Please fill all required fields.'); return; }
    if (step < 2) { setStep(s => s + 1); return; }
    setSaving(true);
    try {
      await saveToFirestore({ onboardingComplete: true });
      toast.success('Onboarding complete! Welcome aboard 🎉');
      navigate('/founder/dashboard');
    } catch { toast.error('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  }

  async function handleSaveExit() {
    setSaving(true);
    try {
      await saveToFirestore({ onboardingComplete: false });
      toast.success('Progress saved!');
      navigate('/founder/dashboard');
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  }

  const pct = form.onboardingComplete ? 100 : step === 0 ? 33 : step === 1 ? 66 : 90;
  const circleR = 44;
  const circumference = 2 * Math.PI * circleR;
  const offset = circumference - (pct / 100) * circumference;
  const inp = 'input-field';
  const sel = 'input-field appearance-none';
  const lbl = 'block text-sm font-medium text-text-primary mb-1.5';

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Rocket size={22} className="text-primary" /> Startup Onboarding
        </h1>
        <p className="text-text-secondary text-sm mt-1">Complete your profile to unlock all features</p>
      </div>

      {/* Stepper bar */}
      <div className="bg-white rounded-2xl shadow-card py-6 px-10 mb-6 relative">
        {/* Line Track */}
        <div className="absolute top-11 left-16 right-16">
          <div className="w-full h-1 bg-slate-100 rounded-full absolute" />
          <div className="h-1 bg-primary rounded-full absolute transition-all duration-500"
            style={{ width: step === 0 ? '0%' : step === 1 ? '50%' : '100%' }} />
        </div>
        
        {/* Steps */}
        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((_, i) => (
            <div key={i} className="bg-white px-2">
              <StepCircle idx={i} current={form.onboardingComplete ? 3 : step} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form card */}
        <div className="col-span-2 bg-white rounded-2xl shadow-card p-7">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-primary text-sm font-bold flex items-center justify-center">{Math.min(step+1, 3)}</span>
            {STEPS[Math.min(step, 2)]}
          </h2>

          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Full Name <span className="text-red-400">*</span></label>
                <input className={inp} value={form.fullName} onChange={set('fullName')} placeholder="Jane Smith" />
              </div>
              <div>
                <label className={lbl}>Email Address</label>
                <input className={inp} value={form.email} readOnly />
              </div>
              <div>
                <label className={lbl}>Phone <span className="text-red-400">*</span></label>
                <input className={inp} value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className={lbl}>Country <span className="text-red-400">*</span></label>
                <select className={sel} value={form.country} onChange={set('country')}>
                  <option value="">Select country</option>
                  {['India','USA','UK','Canada','Australia','Singapore','Other'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Role <span className="text-red-400">*</span></label>
                <select className={sel} value={form.role} onChange={set('role')}>
                  <option value="">Select role</option>
                  {['Founder','Co-Founder','CTO','CMO','Other'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Preferred Language</label>
                <select className={sel} value={form.language} onChange={set('language')}>
                  <option value="">Select language</option>
                  {['English','Hindi','Gujarati','Marathi','Tamil','Other'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Startup Name <span className="text-red-400">*</span></label>
                <input className={inp} value={form.startupName} onChange={set('startupName')} placeholder="InnovateTech" />
              </div>
              <div>
                <label className={lbl}>Industry <span className="text-red-400">*</span></label>
                <select className={sel} value={form.industry} onChange={set('industry')}>
                  <option value="">Select industry</option>
                  {['FinTech','HealthTech','EdTech','AI/ML','AgriTech','CleanTech','Other'].map(i=><option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Stage <span className="text-red-400">*</span></label>
                <select className={sel} value={form.stage} onChange={set('stage')}>
                  <option value="">Select stage</option>
                  {['Idea','MVP','Growth','Scale'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Team Size <span className="text-red-400">*</span></label>
                <input type="number" min="1" className={inp} value={form.teamSize} onChange={set('teamSize')} placeholder="5" />
              </div>
              <div>
                <label className={lbl}>Website URL <span className="text-slate-400 font-normal">(optional)</span></label>
                <input className={inp} value={form.website} onChange={set('website')} placeholder="https://yourstartup.com" />
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Startup Description <span className="text-red-400">*</span></label>
                <textarea rows={3} className={inp+' resize-none py-3 leading-relaxed'} value={form.description} onChange={set('description')} placeholder="What does your startup do?" />
              </div>
              <div>
                <label className={lbl}>Problem Being Solved <span className="text-red-400">*</span></label>
                <textarea rows={3} className={inp+' resize-none py-3 leading-relaxed'} value={form.problem} onChange={set('problem')} placeholder="What pain point are you addressing?" />
              </div>
              <div>
                <label className={lbl}>Target Audience <span className="text-red-400">*</span></label>
                <input className={inp} value={form.targetAudience} onChange={set('targetAudience')} placeholder="e.g. Small businesses, college students..." />
              </div>
              <div>
                <label className={lbl}>Revenue Model <span className="text-red-400">*</span></label>
                <select className={sel} value={form.revenueModel} onChange={set('revenueModel')}>
                  <option value="">Select model</option>
                  {['SaaS Subscription','Freemium','Marketplace','Direct Sales','Ad-based','Other'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <div className="flex gap-3">
              {step > 0 && step < 3 && <button onClick={() => setStep(s=>s-1)} className="btn-outline">← Back</button>}
              {step < 3 && (
                <button onClick={handleSaveExit} className="px-5 py-2.5 text-sm font-semibold text-text-secondary border border-slate-200 hover:border-slate-300 rounded-lg transition-all">
                  Save & Exit
                </button>
              )}
            </div>
            {step < 2 ? (
              <button onClick={handleNext} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving
                  ? <span className="spinner !w-4 !h-4" />
                  : <>Next: {STEPS[step+1]} <ChevronRight size={16}/></>
                }
              </button>
            ) : !form.onboardingComplete ? (
              <button onClick={handleNext} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <span className="spinner !w-4 !h-4" /> : 'Complete Onboarding ✓'}
              </button>
            ) : (
              <button onClick={() => navigate('/founder/dashboard')} className="btn-primary flex items-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5 text-center flex flex-col items-center">
            <div className="relative w-[110px] h-[110px] mx-auto mb-2">
              <svg width="110" height="110" className="-rotate-90">
                <circle cx="55" cy="55" r={circleR} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="55" cy="55" r={circleR} fill="none" stroke="#6366f1" strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-primary">{pct}%</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary font-medium">Complete</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="text-sm font-bold text-text-primary mb-3">Progress Checklist</p>
            {STEPS.map((s, i) => {
              const st = form.onboardingComplete ? 'done' : i < step ? 'done' : i === step ? 'active' : 'pending';
              return (
                <div key={s} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  {st==='done' ? <CheckCircle2 size={16} className="text-green-500 shrink-0"/>
                   : st==='active' ? <Clock size={16} className="text-primary shrink-0"/>
                   : <Circle size={16} className="text-slate-300 shrink-0"/>}
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{s}</p>
                    <p className={`text-[10px] font-medium ${st==='done'?'text-green-500':st==='active'?'text-primary':'text-slate-400'}`}>
                      {st==='done'?'Done ✓':st==='active'?'In Progress':'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <p className="text-sm font-bold text-text-primary mb-3">Why Complete Onboarding?</p>
            <div className="space-y-2.5">
              {[
                [Target,     'Get matched with the right mentors'],
                [Star,       'Unlock AI-powered insights'],
                [Users,      'Join our startup community'],
                [TrendingUp, 'Track your growth metrics'],
              ].map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon size={14} className="text-primary shrink-0" />
                  <p className="text-xs text-text-secondary">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
