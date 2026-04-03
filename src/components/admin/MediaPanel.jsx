import { humanizeKey, collectMediaRefs } from '@/lib/contentEditorUtils';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

export default function MediaPanel({ content, onChangeValue, onUploadMedia, uploadingPath }) {
  const mediaItems = collectMediaRefs(content);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Media Library</h2>
        <p className="text-white/45 text-sm mt-2">All image references currently used by the draft snapshot.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {mediaItems.map((item) => {
          const pathKey = item.path.join('.');
          const imageUrl = resolveMediaSrc(item.value);

          return (
            <div key={pathKey} className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-white font-medium">{humanizeKey(item.path[item.path.length - 1])}</div>
                <div className="text-white/35 text-xs">{pathKey}</div>
              </div>

              {imageUrl ? (
                <img src={imageUrl} alt={item.value.alt || pathKey} className="w-full max-h-64 object-cover rounded-xl" />
              ) : (
                <div className="rounded-xl p-6 text-center text-white/35 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                  No image selected
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Alt Text</label>
                  <input value={item.value.alt || ''} onChange={(event) => onChangeValue(item.path, { ...item.value, alt: event.target.value })} className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-blue-300 hover:text-white cursor-pointer transition-colors" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {uploadingPath === pathKey ? 'Uploading...' : 'Upload / Replace'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPath === pathKey}
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          onUploadMedia(item.path, file);
                        }

                        event.target.value = '';
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => onChangeValue(item.path, { path: '', url: '', alt: '' })} className="px-4 py-2 rounded-xl text-sm text-white/55 hover:text-red-300 transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
