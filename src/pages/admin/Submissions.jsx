// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Heart, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/admin-portal/PageHeader';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { cn } from '@/lib/utils';
import { listSubmissions, updateSubmissionStatus } from '@/lib/siteContentApi';

function StatusPill({ status }) {
  const classes = {
    new: 'border-blue-200 bg-blue-50 text-blue-700',
    read: 'border-border bg-muted text-muted-foreground',
    archived: 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', classes[status] || classes.new)}>
      {status}
    </span>
  );
}

function SubmissionCard({ item, onUpdate }) {
  return (
    <article className={cn(
      'p-5',
      item.status === 'new' ? 'admin-surface ring-1 ring-blue-200/80' : 'admin-surface',
    )}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{item.name || 'Anonymous'}</span>
            {item.email ? <span className="text-xs text-muted-foreground">{item.email}</span> : null}
            {item.isPrivate ? <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">Private</span> : null}
            <StatusPill status={item.status || 'new'} />
          </div>
          {item.type === 'contact' && item.subject ? <p className="mb-2 text-sm text-primary">{item.subject}</p> : null}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{item.message}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'No timestamp'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.status !== 'read' ? (
            <button type="button" onClick={() => onUpdate(item, 'read')} className="admin-toolbar-button min-h-[2.4rem] px-3 text-xs text-muted-foreground">
              Mark Read
            </button>
          ) : null}
          {item.status !== 'archived' ? (
            <button type="button" onClick={() => onUpdate(item, 'archived')} className="admin-toolbar-button min-h-[2.4rem] border-amber-200 bg-amber-50 px-3 text-xs text-amber-700">
              Archive
            </button>
          ) : (
            <button type="button" onClick={() => onUpdate(item, 'read')} className="admin-toolbar-button min-h-[2.4rem] px-3 text-xs text-muted-foreground">
              Restore
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function AdminSubmissionsPage() {
  const admin = useAdminPortal();
  const { setError, setNotice } = admin;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('active');

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const results = await listSubmissions();
      setItems(results);
    } catch (error) {
      setError(error.message || 'Unable to load submissions.');
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  const contacts = useMemo(() => items.filter((item) => item.type === 'contact'), [items]);
  const prayers = useMemo(() => items.filter((item) => item.type === 'prayer'), [items]);
  const visibleContacts = contacts.filter((item) => view === 'archived' ? item.status === 'archived' : item.status !== 'archived');
  const visiblePrayers = prayers.filter((item) => view === 'archived' ? item.status === 'archived' : item.status !== 'archived');

  async function handleUpdate(item, status) {
    try {
      await updateSubmissionStatus(item.type, item.id, status);
      setNotice('Submission updated.');
      await load();
    } catch (error) {
      setError(error.message || 'Unable to update submission.');
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Messages" subtitle="Messages from the public contact form and prayer request form.">
        <div className="admin-chip-set">
          {['active', 'archived'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={`admin-chip ${
                view === value ? 'admin-chip admin-chip-active' : 'admin-chip'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </PageHeader>

      <Tabs defaultValue="contact">
        <TabsList className="admin-chip-set mb-6 h-auto justify-start bg-transparent p-1">
          <TabsTrigger value="contact" className="gap-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <Mail className="h-4 w-4" />
            Contact
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{contacts.filter((item) => item.status === 'new').length}</span>
          </TabsTrigger>
          <TabsTrigger value="prayer" className="gap-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <Heart className="h-4 w-4" />
            Prayer
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{prayers.filter((item) => item.status === 'new').length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          {loading ? <div className="py-10 text-sm text-muted-foreground">Loading submissions…</div> : null}
          {!loading && visibleContacts.length === 0 ? <div className="admin-empty-state">No {view} contact submissions.</div> : null}
          {visibleContacts.map((item) => <SubmissionCard key={item.id} item={item} onUpdate={handleUpdate} />)}
        </TabsContent>

        <TabsContent value="prayer" className="space-y-4">
          {loading ? <div className="py-10 text-sm text-muted-foreground">Loading submissions…</div> : null}
          {!loading && visiblePrayers.length === 0 ? <div className="admin-empty-state">No {view} prayer requests.</div> : null}
          {visiblePrayers.map((item) => <SubmissionCard key={item.id} item={item} onUpdate={handleUpdate} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
