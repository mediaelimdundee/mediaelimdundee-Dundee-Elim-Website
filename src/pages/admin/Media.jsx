// @ts-nocheck
import { useMemo } from 'react';
import { Copy, Trash2, Upload } from 'lucide-react';
import PageHeader from '@/components/admin-portal/PageHeader';
import PublishControls from '@/components/admin-portal/PublishControls';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { collectMediaRefs, humanizeKey } from '@/lib/contentEditorUtils';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

export default function AdminMediaPage() {
  const admin = useAdminPortal();
  const mediaItems = useMemo(() => collectMediaRefs(admin.draftContent), [admin.draftContent]);

  function copyUrl(url) {
    navigator.clipboard.writeText(url || '');
    admin.setNotice('Media URL copied.');
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Media" subtitle="Replace image assets referenced throughout the current draft." />

      <PublishControls />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mediaItems.map((item) => {
          const pathKey = item.path.join('.');
          const src = resolveMediaSrc(item.value);

          return (
            <article key={pathKey} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {src ? (
                <img src={src} alt={item.value.alt || pathKey} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center bg-muted/40 text-sm text-muted-foreground">No image selected</div>
              )}
              <div className="space-y-4 p-5">
                <div>
                  <div className="text-sm font-medium text-foreground">{humanizeKey(item.path[item.path.length - 1])}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{pathKey}</div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Alt Text</label>
                  <input
                    value={item.value.alt || ''}
                    onChange={(event) => admin.updateValue(item.path, { ...item.value, alt: event.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                    <Upload className="h-4 w-4" />
                    {admin.uploadingPath === pathKey ? 'Uploading…' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={admin.uploadingPath === pathKey}
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          admin.replaceMediaAtPath(item.path, file);
                        }

                        event.target.value = '';
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => copyUrl(src)} className="rounded-xl border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                    <Copy className="mr-2 inline h-4 w-4" />
                    Copy URL
                  </button>
                  <button type="button" onClick={() => admin.updateValue(item.path, { path: '', url: '', alt: '' })} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-500 hover:text-red-600">
                    <Trash2 className="mr-2 inline h-4 w-4" />
                    Clear
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
