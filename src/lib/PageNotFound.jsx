import { Link, useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1) || 'home';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full lg-surface rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="font-display text-6xl text-white/20">404</h1>
            <div className="h-px w-20 bg-white/10 mx-auto"></div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">Page Not Found</h2>
            <p className="text-white/50 leading-relaxed">
              The page <span className="text-white">/{pageName}</span> is not available on this website.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center px-5 py-3 rounded-2xl lg-btn-primary text-sm font-medium">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
