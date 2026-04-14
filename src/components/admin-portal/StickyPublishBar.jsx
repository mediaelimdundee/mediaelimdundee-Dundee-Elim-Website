// @ts-nocheck
import { Globe, Loader2, Save } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { cn } from '@/lib/utils';

const EDITABLE_PREFIXES = [
  '/admin/website/',
  '/admin/sermons',
  '/admin/events',
  '/admin/ministries',
];

function formatStamp(value) {
  if (!value) {
    return 'Not yet';
  }

  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function StickyPublishBar() {
  const admin = useAdminPortal();
  const location = useLocation();

  const showBar = EDITABLE_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  if (!showBar) {
    return null;
  }

  return (
    <div
      className={cn(
        'admin-surface sticky top-3 z-20 mb-6 px-4 py-4',
        admin.hasUnsavedChanges ? 'ring-1 ring-amber-200/80' : 'ring-1 ring-emerald-100/80',
      )}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex h-2.5 w-2.5 rounded-full',
                admin.hasUnsavedChanges ? 'bg-amber-500' : 'bg-emerald-500',
              )}
            />
            <p className="text-sm font-medium text-foreground">
              {admin.hasUnsavedChanges ? 'Changes are ready to save' : 'Draft is up to date'}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Last saved: {formatStamp(admin.draftMetadata?.updatedAt)}</span>
            <span>Last published: {formatStamp(admin.publishedMetadata?.publishedAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => admin.saveDraft()}
            disabled={admin.saving}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe1ea] bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-opacity disabled:opacity-60"
          >
            {admin.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => admin.publishSite()}
            disabled={admin.publishing}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#4857d6] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(72,87,214,0.2)] transition-opacity disabled:opacity-60"
          >
            {admin.publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Publish Site
          </button>
        </div>
      </div>
    </div>
  );
}
