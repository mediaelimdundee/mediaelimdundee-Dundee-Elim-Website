// @ts-nocheck
import { useMemo, useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import EditorSection from '@/components/admin-portal/EditorSection';
import ImageUpload from '@/components/admin-portal/ImageUpload';
import PageHeader from '@/components/admin-portal/PageHeader';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { applyMinistryRecords, createAdminId, getMinistryRecords } from '@/lib/adminPortalAdapters';
import { cloneValue } from '@/lib/contentEditorUtils';
import { ministryThemeMap } from '@/lib/sitePresentation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const TAG_OPTIONS = ['Discover', 'Community', 'Children', 'Serve'];
const ICON_OPTIONS = ['heart', 'users', 'zap', 'star', 'church', 'book-open', 'utensils-crossed', 'baby', 'music'];
const THEME_OPTIONS = ['red', 'orange', 'blue', 'green', 'pink', 'indigo', 'amber', 'yellow', 'purple'];

const EMPTY_FORM = {
  id: '',
  title: '',
  tag: 'Discover',
  summary: '',
  body: '',
  detailsText: '',
  linkLabel: '',
  linkUrl: '',
  contactEmail: '',
  contactPhone: '',
  iconKey: 'users',
  theme: 'blue',
  status: 'draft',
  publishedAt: '',
};

export default function AdminMinistriesPage() {
  const admin = useAdminPortal();
  const [tagFilter, setTagFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const ministries = useMemo(() => getMinistryRecords(admin.draftContent), [admin.draftContent]);
  const filtered = useMemo(() => (
    tagFilter === 'All' ? ministries : ministries.filter((item) => item.tag === tagFilter)
  ), [ministries, tagFilter]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNew() {
    setEditingKey('');
    setForm(cloneValue(EMPTY_FORM));
    setOpen(true);
  }

  function openEdit(ministry) {
    setEditingKey(ministry._key);
    setForm(cloneValue({
      ...EMPTY_FORM,
      ...ministry,
      detailsText: (ministry.details || []).join('\n'),
    }));
    setOpen(true);
  }

  function saveRecord() {
    if (!form.title.trim()) {
      admin.setError('Ministry title is required.');
      return;
    }

    const nextRecord = {
      ...form,
      id: form.id || createAdminId('ministry'),
      details: form.detailsText.split('\n').map((item) => item.trim()).filter(Boolean),
      status: form.status || 'draft',
      publishedAt: form.status === 'published' ? (form.publishedAt || new Date().toISOString()) : '',
      _key: editingKey || form.id || createAdminId('ministry'),
    };
    delete nextRecord.detailsText;

    admin.updateDraft((current) => {
      const currentRecords = getMinistryRecords(current);
      const nextRecords = editingKey
        ? currentRecords.map((item) => (item._key === editingKey ? nextRecord : item))
        : [nextRecord, ...currentRecords];
      return applyMinistryRecords(current, nextRecords);
    });
    admin.setNotice(editingKey ? 'Ministry updated in draft.' : 'Ministry added to draft.');
    setOpen(false);
  }

  function removeRecord(key) {
    admin.updateDraft((current) => applyMinistryRecords(current, getMinistryRecords(current).filter((item) => item._key !== key)));
    admin.setNotice('Ministry removed from draft.');
  }

  function toggleStatus(record) {
    const nextStatus = record.status === 'published' ? 'draft' : 'published';
    admin.updateDraft((current) => {
      const nextRecords = getMinistryRecords(current).map((item) => (
        item._key === record._key
          ? {
              ...item,
              status: nextStatus,
              publishedAt: nextStatus === 'published' ? (item.publishedAt || new Date().toISOString()) : '',
            }
          : item
      ));
      return applyMinistryRecords(current, nextRecords);
    });
    admin.setNotice(nextStatus === 'published' ? 'Ministry will show on the website after you publish.' : 'Ministry hidden from the website draft.');
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Ministries" subtitle="Manage ministry cards and the details people see when they open them.">
        <div className="flex flex-wrap items-center gap-2">
          {['All', ...TAG_OPTIONS].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTagFilter(value)}
              className={`admin-chip ${
                tagFilter === value ? 'admin-chip admin-chip-active' : 'admin-chip border border-transparent'
              }`}
            >
              {value}
            </button>
          ))}
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ministry
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((ministry) => {
          const tone = ministryThemeMap[ministry.theme] || ministryThemeMap.blue;

          return (
            <article key={ministry._key} className="admin-surface p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full border border-[#dbe1ea] bg-[#f5f7fb] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{ministry.tag}</span>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">{ministry.title}</h3>
                </div>
                <div className="rounded-full border border-[#dbe1ea] bg-[#f5f7fb] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {ministry.status === 'published' ? 'Visible' : 'Hidden'}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{ministry.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full px-2 py-1" style={{ background: tone.bg }}>{ministry.theme}</span>
                <span>{ministry.iconKey}</span>
              </div>
              <div className="admin-surface-muted mt-4 flex items-center justify-between px-3 py-2">
                <div className="text-xs text-muted-foreground">Show on website</div>
                <Switch checked={ministry.status === 'published'} onCheckedChange={() => toggleStatus(ministry)} />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(ministry)}>Edit</Button>
                {ministry.linkUrl ? (
                  <a href={ministry.linkUrl} target="_blank" rel="noreferrer" className="admin-icon-button">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
                <button type="button" onClick={() => removeRecord(ministry._key)} className="admin-icon-button-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <div className="admin-empty-state">No ministries match this filter yet.</div>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <EditorSection title="Photo Strip" description="Images shown beneath the ministry cards on the public site.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Images</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => admin.updateValue(['ministries', 'photoStrip'], [...admin.draftContent.ministries.photoStrip, { path: '', url: '', alt: '' }])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Image
              </Button>
            </div>

            {admin.draftContent.ministries.photoStrip.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photo strip images yet.</p>
            ) : null}

            {admin.draftContent.ministries.photoStrip.map((image, index) => (
              <div key={`photo-strip-${index}`} className="admin-surface-muted space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Image {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => admin.updateValue(['ministries', 'photoStrip'], admin.draftContent.ministries.photoStrip.filter((_, imageIndex) => imageIndex !== index))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <ImageUpload
                  label="Image"
                  value={image}
                  busy={admin.uploadingPath === `ministries.photoStrip.${index}`}
                  onUpload={(file) => admin.replaceMediaAtPath(['ministries', 'photoStrip', index], file)}
                  onChange={(value) => admin.updateValue(['ministries', 'photoStrip'], admin.draftContent.ministries.photoStrip.map((item, imageIndex) => (
                    imageIndex === index ? value : item
                  )))}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Alt Text</label>
                  <Input
                    value={image.alt || ''}
                    onChange={(event) => admin.updateValue(['ministries', 'photoStrip'], admin.draftContent.ministries.photoStrip.map((item, imageIndex) => (
                      imageIndex === index ? { ...item, alt: event.target.value } : item
                    )))}
                  />
                </div>
              </div>
            ))}
          </div>
        </EditorSection>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl rounded-[1.35rem] border-[#dbe1ea] bg-white text-foreground shadow-[0_22px_50px_rgba(25,35,58,0.18)]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editingKey ? 'Edit Ministry' : 'Add Ministry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
                <Input value={form.title} onChange={(event) => updateForm('title', event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Tag</label>
                <Select value={form.tag} onValueChange={(value) => updateForm('tag', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TAG_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Icon</label>
                <Select value={form.iconKey} onValueChange={(value) => updateForm('iconKey', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Theme</label>
                <Select value={form.theme} onValueChange={(value) => updateForm('theme', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Summary</label>
              <Textarea value={form.summary} onChange={(event) => updateForm('summary', event.target.value)} rows={3} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Body</label>
              <Textarea value={form.body} onChange={(event) => updateForm('body', event.target.value)} rows={8} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Details (one per line)</label>
              <Textarea value={form.detailsText} onChange={(event) => updateForm('detailsText', event.target.value)} rows={5} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Link Label</label>
                <Input value={form.linkLabel} onChange={(event) => updateForm('linkLabel', event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Link URL</label>
                <Input value={form.linkUrl} onChange={(event) => updateForm('linkUrl', event.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Contact Email</label>
                <Input value={form.contactEmail} onChange={(event) => updateForm('contactEmail', event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Contact Phone</label>
                <Input value={form.contactPhone} onChange={(event) => updateForm('contactPhone', event.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <label className="inline-flex items-center gap-3 text-sm text-foreground">
                <Switch checked={form.status === 'published'} onCheckedChange={(checked) => updateForm('status', checked ? 'published' : 'draft')} />
                Show this ministry on the website
              </label>
              <Button onClick={saveRecord}>Save Ministry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
