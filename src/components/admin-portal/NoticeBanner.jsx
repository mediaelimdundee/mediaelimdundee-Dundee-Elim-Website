// @ts-nocheck
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useAdminPortal } from '@/contexts/AdminPortalContext';

export default function NoticeBanner() {
  const admin = useAdminPortal();

  if (!admin.error && !admin.notice) {
    return null;
  }

  const isError = Boolean(admin.error);
  const message = admin.error || admin.notice;

  return (
    <div
      className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${
        isError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? <AlertTriangle className="h-4 w-4 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 mt-0.5" />}
        <span>{message}</span>
      </div>
      <button type="button" onClick={() => {
        admin.setError('');
        admin.setNotice('');
      }}>
        <X className="h-4 w-4 opacity-70" />
      </button>
    </div>
  );
}
