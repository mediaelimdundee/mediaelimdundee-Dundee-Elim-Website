import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const inputClass = 'w-full rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' };

export default function AdminLogin() {
  const auth = useAdminAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  if (auth.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await auth.signIn(email, password);
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md lg-surface rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Login</h1>
          <p className="text-white/45 text-sm mt-2">Shared access for content, media, and submissions.</p>
        </div>

        {!auth.isConfigured && (
          <div className="rounded-2xl p-4 text-sm text-white/70 mb-6" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <div className="font-medium text-yellow-300 mb-1">Supabase setup required</div>
            <p>Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before using the standalone admin.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputClass} pl-10`}
                style={inputStyle}
                disabled={!auth.isConfigured || submitting}
                placeholder="admin@dundee-elim.org.uk"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              style={inputStyle}
              disabled={!auth.isConfigured || submitting}
              placeholder="Shared admin password"
            />
          </div>

          {error && (
            <div className="rounded-2xl p-3 text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!auth.isConfigured || submitting}
            className="w-full py-3.5 rounded-2xl lg-btn-primary transition-all text-white font-semibold disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
