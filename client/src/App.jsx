import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FounderRoute, InvestorRoute, AdminRoute } from './components/RoleRoutes';
import Layout from './components/Layout';

// Shared
import Login from './pages/Login';
import Register from './pages/Register';

// Founder
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Mentorship from './pages/Mentorship';
import Sandbox from './pages/Sandbox';
import Performance from './pages/Performance';
import Compliance from './pages/Compliance';
import Resources from './pages/Resources';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

// Investor
import InvestorDashboard from './pages/InvestorDashboard';
import StartupBrowser from './pages/StartupBrowser';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import StartupManagement from './pages/StartupManagement';
import AdminMentors from './pages/AdminMentors';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }} />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* FOUNDER ROUTES */}
          <Route path="/founder/dashboard" element={<FounderRoute><Layout><Dashboard /></Layout></FounderRoute>} />
          <Route path="/founder/onboarding" element={<FounderRoute><Layout><Onboarding /></Layout></FounderRoute>} />
          <Route path="/founder/mentorship" element={<FounderRoute><Layout><Mentorship /></Layout></FounderRoute>} />
          <Route path="/founder/sandbox" element={<FounderRoute><Layout><Sandbox /></Layout></FounderRoute>} />
          <Route path="/founder/performance" element={<FounderRoute><Layout><Performance /></Layout></FounderRoute>} />
          <Route path="/founder/compliance" element={<FounderRoute><Layout><Compliance /></Layout></FounderRoute>} />
          <Route path="/founder/resources" element={<FounderRoute><Layout><Resources /></Layout></FounderRoute>} />
          <Route path="/founder/messages" element={<FounderRoute><Layout><Messages /></Layout></FounderRoute>} />
          <Route path="/founder/settings" element={<FounderRoute><Layout><Settings /></Layout></FounderRoute>} />

          {/* INVESTOR ROUTES */}
          <Route path="/investor/dashboard" element={<InvestorRoute><Layout><InvestorDashboard /></Layout></InvestorRoute>} />
          <Route path="/investor/startups" element={<InvestorRoute><Layout><StartupBrowser /></Layout></InvestorRoute>} />
          <Route path="/investor/pipeline" element={<InvestorRoute><Layout><Placeholder /></Layout></InvestorRoute>} />
          <Route path="/investor/messages" element={<InvestorRoute><Layout><Placeholder /></Layout></InvestorRoute>} />
          <Route path="/investor/settings" element={<InvestorRoute><Layout><Placeholder /></Layout></InvestorRoute>} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/dashboard" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Layout><UserManagement /></Layout></AdminRoute>} />
          <Route path="/admin/startups" element={<AdminRoute><Layout><StartupManagement /></Layout></AdminRoute>} />
          <Route path="/admin/mentors" element={<AdminRoute><Layout><AdminMentors /></Layout></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Layout><Placeholder /></Layout></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><Layout><Placeholder /></Layout></AdminRoute>} />

          {/* Default redirect - checks role if possible, but easiest is to send to login where they will be redirected to their dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
