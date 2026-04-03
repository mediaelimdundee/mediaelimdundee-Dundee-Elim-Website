import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function ProtectedAdminRoute({ children }) {
  const auth = useAdminAuth();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="lg-surface rounded-3xl px-8 py-6 text-center">
          <div className="text-white font-semibold">Checking admin session...</div>
          <div className="text-white/45 text-sm mt-2">Please wait.</div>
        </div>
      </div>
    );
  }

  if (!auth.isConfigured) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
