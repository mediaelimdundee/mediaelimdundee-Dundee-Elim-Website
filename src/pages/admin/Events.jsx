// @ts-nocheck
import { useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin-portal/PageHeader';
import ImageUpload from '@/components/admin-portal/ImageUpload';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { applyEventRecords, createAdminId, getEventRecords } from '@/lib/adminPortalAdapters';
import { cloneValue } from '@/lib/contentEditorUtils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const CATEGORY_OPTIONS = ['service', 'prayer', 'youth', 'community', 'special'];

const EMPTY_FORM = {
  id: '',
  title: '',
  description: '',
  location: '',
  category: 'service',
  eventType: 'one_off',
  date: '',
  time: '',
  image: { path: '', url: '', alt: '' },
  weekday: 'sunday',
  intervalWeeks: 1,
  startDate: '',
  recurringLabel: '',
  status: 'draft',
  publishedAt: '',
};

export default function AdminEventsPage() {
  const admin = useAdminPortal();
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const events = useMemo(() => getEventRecords(admin.draftContent), [admin.draftContent]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNew() {
    setEditingKey('');
    setForm(cloneValue(EMPTY_FORM));
    setOpen(true);
  }

  function openEdit(event) {
    setEditingKey(event._key);
    setForm(cloneValue({ ...EMPTY_FORM, ...event }));
    setOpen(true);
  }

  function saveRecord() {
    if (!form.title.trim()) {
      admin.setError('Event title is required.');
      return;
    }

    if (form.eventType === 'one_off' && !form.date) {
      admin.setError('Choose a date for one-off events.');
      return;
    }

    if (form.eventType === 'recurring' && !form.startDate) {
      admin.setError('Choose a start date for recurring events.');
      return;
    }

    const nextRecord = {
      ...form,
      id: form.id || createAdminId('event'),
      status: form.status || 'draft',
      publishedAt: form.status === 'published' ? (form.publishedAt || new Date().toISOString()) : '',
      _key: editingKey || form.id || createAdminId('event'),
    };

    admin.updateDraft((current) => {
      const currentRecords = getEventRecords(current);
      const nextRecords = editingKey
        ? currentRecords.map((event) => (event._key === editingKey ? nextRecord : event))
        : [nextRecord, ...currentRecords];
      return applyEventRecords(current, nextRecords);
    });
    admin.setNotice(editingKey ? 'Event updated in draft.' : 'Event added to draft.');
    setOpen(false);
  }

  function removeRecord(key) {
    admin.updateDraft((current) => applyEventRecords(current, getEventRecords(current).filter((event) => event._key !== key)));
    admin.setNotice('Event removed from draft.');
  }

  function toggleVisibility(record) {
    const nextStatus = record.status === 'published' ? 'draft' : 'published';
    admin.updateDraft((current) => {
      const nextRecords = getEventRecords(current).map((event) => (
        event._key === record._key
          ? {
              ...event,
              status: nextStatus,
              publishedAt: nextStatus === 'published' ? (event.publishedAt || new Date().toISOString()) : '',
            }
          : event
      ));
      return applyEventRecords(current, nextRecords);
    });
    admin.setNotice(nextStatus === 'published' ? 'Event will show on the website after you publish.' : 'Event hidden from the website draft.');
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Events" subtitle="Manage regular gatherings and special events.">
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </PageHeader>

      <div className="admin-surface mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f6f8fc] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Show on website</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr key={event._key} className="hover:bg-[#f8f9fc]">
                <td className="px-5 py-4 font-medium text-foreground">{event.title}</td>
                <td className="px-4 py-4 text-muted-foreground">{event.eventType === 'recurring' ? event.recurringLabel || event.weekday : event.date}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    {event.eventType === 'recurring' ? <RefreshCw className="h-3.5 w-3.5" /> : null}
                    {event.eventType === 'recurring' ? 'Recurring' : 'One-off'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={event.status === 'published'} onCheckedChange={() => toggleVisibility(event)} />
                    <span className="text-xs text-muted-foreground">{event.status === 'published' ? 'Visible' : 'Hidden'}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => openEdit(event)} className="rounded-xl border border-[#dbe1ea] bg-white p-2 text-muted-foreground shadow-sm hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => removeRecord(event._key)} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14">
                  <div className="admin-empty-state">No events yet. Add a regular gathering or special event to get started.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-[1.5rem] border-[#dbe1ea] bg-white text-foreground shadow-[0_22px_50px_rgba(25,35,58,0.18)]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editingKey ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
              <Input value={form.title} onChange={(event) => updateForm('title', event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
              <Textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={4} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Location</label>
                <Input value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
                <Select value={form.category} onValueChange={(value) => updateForm('category', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Event Type</label>
                <Select value={form.eventType} onValueChange={(value) => updateForm('eventType', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_off">One-off</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Time</label>
                <Input value={form.time} onChange={(event) => updateForm('time', event.target.value)} placeholder="7:00 PM" />
              </div>
            </div>

            {form.eventType === 'one_off' ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
                    <Input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
                  </div>
                </div>
                <ImageUpload
                  label="Event Image"
                  value={form.image}
                  busy={false}
                  onUpload={async (file) => {
                    const media = await admin.uploadFile(file);
                    updateForm('image', media);
                  }}
                  onChange={(value) => updateForm('image', value)}
                />
              </>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Weekday</label>
                  <Select value={form.weekday} onValueChange={(value) => updateForm('weekday', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Every N Weeks</label>
                  <Input type="number" min="1" value={form.intervalWeeks} onChange={(event) => updateForm('intervalWeeks', Number(event.target.value) || 1)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Start Date</label>
                  <Input type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-foreground">Recurring Label</label>
                  <Input value={form.recurringLabel} onChange={(event) => updateForm('recurringLabel', event.target.value)} placeholder="Every Sunday" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <label className="inline-flex items-center gap-3 text-sm text-foreground">
                <Switch checked={form.status === 'published'} onCheckedChange={(checked) => updateForm('status', checked ? 'published' : 'draft')} />
                Show this event on the website
              </label>
              <Button onClick={saveRecord}>Save Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
