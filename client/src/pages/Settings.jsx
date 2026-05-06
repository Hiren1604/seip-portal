import { useState } from 'react';
import { User, Bell, CreditCard, Shield, Save } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Startup Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-0.5">Manage your account settings and preferences.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-card border border-slate-50 p-8">
          
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Startup Profile</h2>
                <p className="text-sm text-slate-500 mt-1">Update your company details and public profile.</p>
              </div>
              <hr className="border-slate-100" />
              
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Upload Logo
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Startup Name</label>
                      <input type="text" defaultValue="Nexus AI" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Industry</label>
                      <input type="text" defaultValue="AI/ML" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                    <input type="url" defaultValue="https://nexusai.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Short Description</label>
                    <textarea className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" defaultValue="Deep-learning powered predictive analytics in real-time." />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="btn-primary flex items-center gap-2 px-6 py-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Settings size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Coming Soon</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">The {tabs.find(t=>t.id===activeTab)?.label} page is currently under development. Check back later!</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
