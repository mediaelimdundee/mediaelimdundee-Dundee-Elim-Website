import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import {
  createBlankValue,
  humanizeKey,
  isMediaAssetRef,
} from '@/lib/contentEditorUtils';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

const enumOptions = {
  theme: ['red', 'orange', 'blue', 'green', 'pink', 'indigo', 'amber', 'yellow', 'purple'],
  iconKey: ['heart', 'users', 'zap', 'star', 'church', 'book-open', 'utensils-crossed', 'baby', 'music'],
  tag: ['Discover', 'Community', 'Children', 'Serve'],
  weekday: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  category: ['service', 'prayer', 'youth', 'community', 'special'],
};

const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30';

function optionsForKey(path, key) {
  const joined = path.join('.');

  if (key === 'kind') {
    if (joined.includes('quickInfo.items')) {
      return ['service', 'location', 'kids'];
    }
    if (joined.includes('methods')) {
      return ['online', 'bank', 'inperson'];
    }
    if (joined.includes('infoCards')) {
      return ['address', 'contact', 'service'];
    }
    if (joined.includes('resources')) {
      return ['elim', 'report', 'policy'];
    }
  }

  return enumOptions[key] || null;
}

function shouldUseTextarea(key, value) {
  return (
    typeof value === 'string' &&
    (
      value.length > 80 ||
      ['description', 'body', 'quote', 'note', 'paragraphs', 'statement', 'summary'].some((item) => key.toLowerCase().includes(item))
    )
  );
}

function MediaAssetEditor({ label, path, value, onChangeValue, onUploadMedia, uploadingPath }) {
  const pathKey = path.join('.');
  const mediaUrl = resolveMediaSrc(value);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-foreground font-medium">{label}</div>
          <div className="text-muted-foreground text-xs">{pathKey}</div>
        </div>
        <button
          type="button"
          onClick={() => onChangeValue(path, { path: '', url: '', alt: '' })}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>

      {mediaUrl ? (
        <img src={mediaUrl} alt={value.alt || label} className="max-h-64 w-full rounded-lg object-cover" />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
          No image selected
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wider">Alt Text</label>
          <input value={value.alt || ''} onChange={(event) => onChangeValue(path, { ...value, alt: event.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wider">Public URL</label>
          <input value={value.url || ''} onChange={(event) => onChangeValue(path, { ...value, url: event.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wider">Storage Path</label>
          <input value={value.path || ''} onChange={(event) => onChangeValue(path, { ...value, path: event.target.value })} className={inputClass} />
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm text-primary transition-colors hover:opacity-80">
        <ImagePlus className="w-4 h-4" />
        {uploadingPath === pathKey ? 'Uploading...' : 'Upload / Replace'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploadingPath === pathKey}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onUploadMedia(path, file);
            }

            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

function PrimitiveField({ label, value, path, onChangeValue }) {
  const key = path[path.length - 1];
  const options = optionsForKey(path, key);

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-3">
        <span className="text-foreground text-sm">{label}</span>
        <input type="checkbox" checked={value} onChange={(event) => onChangeValue(path, event.target.checked)} className="h-4 w-4" />
      </label>
    );
  }

  return (
    <div>
      <label className="block text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wider">{label}</label>
      {options ? (
        <select value={value} onChange={(event) => onChangeValue(path, event.target.value)} className={inputClass}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : shouldUseTextarea(key, value) ? (
        <textarea value={value} rows={5} onChange={(event) => onChangeValue(path, event.target.value)} className={`${inputClass} resize-y`} />
      ) : (
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(event) => onChangeValue(path, typeof value === 'number' ? Number(event.target.value) : event.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function RecursiveContentEditor({
  label,
  value,
  path,
  templateValue,
  onChangeValue,
  onAddArrayItem,
  onRemoveArrayItem,
  onMoveArrayItem,
  onUploadMedia,
  uploadingPath,
}) {
  if (isMediaAssetRef(value)) {
    return (
      <MediaAssetEditor
        label={label}
        path={path}
        value={value}
        onChangeValue={onChangeValue}
        onUploadMedia={onUploadMedia}
        uploadingPath={uploadingPath}
      />
    );
  }

  if (Array.isArray(value)) {
    const itemTemplate = value[0] ?? templateValue?.[0] ?? '';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-foreground font-semibold">{label}</h3>
            <p className="text-muted-foreground text-xs">{path.join('.')}</p>
          </div>
          <button
            type="button"
            onClick={() => onAddArrayItem(path, createBlankValue(itemTemplate))}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary transition-colors hover:opacity-80"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {value.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center text-sm text-muted-foreground">
              No items yet.
            </div>
          )}

          {value.map((item, index) => (
            <div key={index} className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-foreground font-medium">{label} {index + 1}</div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onMoveArrayItem(path, index, index - 1)} disabled={index === 0} className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onMoveArrayItem(path, index, index + 1)} disabled={index === value.length - 1} className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onRemoveArrayItem(path, index)} className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <RecursiveContentEditor
                label={`${label} Item`}
                value={item}
                path={[...path, index]}
                templateValue={itemTemplate}
                onChangeValue={onChangeValue}
                onAddArrayItem={onAddArrayItem}
                onRemoveArrayItem={onRemoveArrayItem}
                onMoveArrayItem={onMoveArrayItem}
                onUploadMedia={onUploadMedia}
                uploadingPath={uploadingPath}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div className="space-y-4">
        {Object.entries(value).map(([key, nestedValue]) => (
          <div key={key} className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <RecursiveContentEditor
              label={humanizeKey(key)}
              value={nestedValue}
              path={[...path, key]}
              templateValue={templateValue?.[key]}
              onChangeValue={onChangeValue}
              onAddArrayItem={onAddArrayItem}
              onRemoveArrayItem={onRemoveArrayItem}
              onMoveArrayItem={onMoveArrayItem}
              onUploadMedia={onUploadMedia}
              uploadingPath={uploadingPath}
            />
          </div>
        ))}
      </div>
    );
  }

  return <PrimitiveField label={label} value={value} path={path} onChangeValue={onChangeValue} />;
}
