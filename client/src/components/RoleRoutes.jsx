import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function FounderRoute({ children }) {
  const { currentUser, userRole } = useAuth();
  
  useEffect(() => {
    if (currentUser && userRole && userRole !== 'founder') {
      toast.error('Access denied. Founders only.');
    }
  }, [currentUser, userRole]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole && userRole !== 'founder') return <Navigate to="/login" replace />;
  
  return children;
}

export function InvestorRoute({ children }) {
  const { currentUser, userRole } = useAuth();
  
  useEffect(() => {
    if (currentUser && userRole && userRole !== 'investor') {
      toast.error('Access denied. Investors only.');
    }
  }, [currentUser, userRole]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole && userRole !== 'investor') return <Navigate to="/login" replace />;
  
  return children;
}

export function AdminRoute({ children }) {
  const { currentUser, userRole } = useAuth();
  
  useEffect(() => {
    if (currentUser && userRole && userRole !== 'admin') {
      toast.error('Access denied. Admins only.');
    }
  }, [currentUser, userRole]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole && userRole !== 'admin') return <Navigate to="/login" replace />;
  
  return children;
}
