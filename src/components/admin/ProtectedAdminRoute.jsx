import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function ProtectedAdminRoute({ children }) {
  const auth = useAdminAuth();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="admin-portal-theme flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border border-border bg-card px-8 py-6 text-center shadow-sm">
          <div className="font-medium text-foreground">Checking admin session...</div>
          <div className="mt-2 text-sm text-muted-foreground">Please wait.</div>
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
