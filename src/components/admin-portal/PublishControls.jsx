// @ts-nocheck
import { Globe, Loader2, RefreshCw, Save } from 'lucide-react';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import StatusBadge from '@/components/admin-portal/StatusBadge';

function formatStamp(value) {
  if (!value) {
    return 'Not yet';
  }

  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function PublishControls({ showStatusBadge = false, status = 'draft' }) {
  const admin = useAdminPortal();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {showStatusBadge ? <StatusBadge status={status} /> : null}
        <button
          type="button"
          onClick={() => admin.reloadDraft()}
          disabled={admin.refreshing}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          {admin.refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Reload
        </button>
        <button
          type="button"
          onClick={() => admin.publishSite()}
          disabled={admin.publishing}
          className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {admin.publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          Publish
        </button>
        <button
          type="button"
          onClick={() => admin.saveDraft()}
          disabled={admin.saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {admin.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </button>
      </div>
      <div className="flex flex-wrap justify-end gap-3 text-xs text-muted-foreground">
        <span>{admin.hasUnsavedChanges ? 'Unsaved draft changes' : 'Draft matches last save'}</span>
        <span>Last saved: {formatStamp(admin.draftMetadata?.updatedAt)}</span>
        <span>Last published: {formatStamp(admin.publishedMetadata?.publishedAt)}</span>
      </div>
    </div>
  );
}
