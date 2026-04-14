// @ts-nocheck
import { Loader2, Upload, X } from 'lucide-react';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

export default function ImageUpload({ label, value, busy = false, onUpload, onChange }) {
  const src = resolveMediaSrc(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {src ? (
        <div className="relative inline-block overflow-hidden rounded-[1.1rem] border border-border bg-muted">
          <img src={src} alt={value?.alt || label} className="h-40 w-auto max-w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange({ path: '', url: '', alt: '' })}
            className="admin-icon-button-danger absolute right-2 top-2 h-7 w-7 rounded-full bg-white/95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-[1.1rem] border-2 border-dashed border-border bg-muted/60 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted">
          {busy ? (
            <Loader2 className="mb-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="mb-2 h-5 w-5" />
              <span className="text-sm">Click to upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                onUpload(file);
              }

              event.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}
