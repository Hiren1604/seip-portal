import { NavLink, useLocation } from 'react-router-dom';
import {
  Rocket, LayoutDashboard, UserCheck, Users, FlaskConical,
  BarChart3, ShieldCheck, BookOpen, MessageSquare, Settings,
  Headphones, ChevronRight, Search, Briefcase, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sidebarConfig = {
  founder: [
    { label: 'Dashboard',    icon: LayoutDashboard, path: '/founder/dashboard' },
    { label: 'My Startup',   icon: UserCheck,       path: '/founder/onboarding' },
    { label: 'AI Report',    icon: Sparkles,        path: '/founder/ai-report' },
    { label: 'Mentorship',   icon: Users,           path: '/founder/mentorship' },
    { label: 'Sandbox',      icon: FlaskConical,    path: '/founder/sandbox' },
    { label: 'Performance',  icon: BarChart3,       path: '/founder/performance' },
    { label: 'Compliance',   icon: ShieldCheck,     path: '/founder/compliance' },
    { label: 'Resources',    icon: BookOpen,        path: '/founder/resources' },
    { label: 'Messages',     icon: MessageSquare,   path: '/founder/messages' },
    { label: 'Settings',     icon: Settings,        path: '/founder/settings' },
  ],
  investor: [
    { label: 'Dashboard',       icon: LayoutDashboard, path: '/investor/dashboard' },
    { label: 'Browse Startups', icon: Search,          path: '/investor/startups' },
    { label: 'My Pipeline',     icon: Briefcase,       path: '/investor/pipeline' },
    { label: 'Messages',        icon: MessageSquare,   path: '/investor/messages' },
    { label: 'Settings',        icon: Settings,        path: '/investor/settings' },
  ],
  admin: [
    { label: 'Dashboard',    icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users',        icon: Users,           path: '/admin/users' },
    { label: 'Startups',     icon: Building2,       path: '/admin/startups' },
    { label: 'Mentors',      icon: UserCheck,       path: '/admin/mentors' },
    { label: 'Analytics',    icon: BarChart3,       path: '/admin/analytics' },
    { label: 'Settings',     icon: Settings,        path: '/admin/settings' },
  ]
};

import { Building2 } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { userRole } = useAuth();

  const role = userRole || 'founder';
  const navItems = sidebarConfig[role] || sidebarConfig.founder;

  const bgStyle = role === 'admin' ? { background: '#1e1b4b' } : { background: '#0f172a' };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col z-30" style={bgStyle}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${role === 'admin' ? 'bg-red-500 shadow-red-500/40' : role === 'investor' ? 'bg-green-500 shadow-green-500/40' : 'bg-primary shadow-primary/40'}`}>
          <Rocket size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">AI Startup</p>
          <p className="text-indigo-400 text-xs font-medium leading-tight">Ecosphere <span className="uppercase text-[9px] text-white/50">{role}</span></p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2">
          Main Menu
        </p>
        {navItems.map(({ label, icon: Icon, path, placeholder }) => {
          const isActive = !placeholder && location.pathname.startsWith(path);
          return (
            <NavLink
              key={label}
              to={placeholder ? '#' : path}
              onClick={placeholder ? (e) => e.preventDefault() : undefined}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-white/10 text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
                ${placeholder ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="flex items-center gap-3">
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'} />
                {label}
              </span>
              {isActive && <ChevronRight size={14} className="text-white/60" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Support */}
      <div className="p-4 mx-3 mb-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)' }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Headphones size={15} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-tight">Need Help?</p>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">Contact Support</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
