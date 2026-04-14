// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  MessageSquare,
  Users,
  Heart,
  Globe,
} from 'lucide-react';
import PageHeader from '@/components/admin-portal/PageHeader';
import StatusBadge from '@/components/admin-portal/StatusBadge';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { getDashboardSnapshot } from '@/lib/adminPortalAdapters';
import { listSubmissions } from '@/lib/siteContentApi';

function StatCard({ label, count, icon: Icon, to, sublabel, tone }) {
  return (
    <Link to={to} className="admin-surface group p-5 transition-transform hover:-translate-y-0.5">
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-[1.05rem] ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-semibold tracking-tight text-foreground">{count}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
      {sublabel ? <div className="mt-1 text-xs text-primary">{sublabel}</div> : null}
      <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        Manage <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const admin = useAdminPortal();
  const [submissionCounts, setSubmissionCounts] = useState({ contacts: 0, prayers: 0 });

  useEffect(() => {
    let active = true;

    listSubmissions({ status: 'new' })
      .then((items) => {
        if (!active) {
          return;
        }

        setSubmissionCounts({
          contacts: items.filter((item) => item.type === 'contact').length,
          prayers: items.filter((item) => item.type === 'prayer').length,
        });
      })
      .catch(() => {
        if (active) {
          setSubmissionCounts({ contacts: 0, prayers: 0 });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const snapshot = useMemo(() => getDashboardSnapshot(admin.draftContent), [admin.draftContent]);
  const recentSermons = snapshot.sermons.slice(0, 4);
  const recentEvents = snapshot.events.slice(0, 4);

  return (
    <div className="max-w-6xl">
      <PageHeader title="Dashboard" subtitle="Overview of the website content, regular collections, and new messages." />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Sermons" count={snapshot.sermons.length} to="/admin/sermons" icon={BookOpen} sublabel={`${snapshot.publishedSermons} published`} tone="bg-blue-500/10 text-blue-600" />
        <StatCard label="Events" count={snapshot.events.length} to="/admin/events" icon={Calendar} tone="bg-violet-500/10 text-violet-600" />
        <StatCard label="Ministries" count={snapshot.ministries.length} to="/admin/ministries" icon={Users} tone="bg-emerald-500/10 text-emerald-600" />
        <StatCard label="Unread Messages" count={submissionCounts.contacts} to="/admin/messages" icon={MessageSquare} tone="bg-orange-500/10 text-orange-600" />
        <StatCard label="Prayer Requests" count={submissionCounts.prayers} to="/admin/messages" icon={Heart} tone="bg-rose-500/10 text-rose-600" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="admin-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Recent Sermons</h2>
          <Link to="/admin/sermons" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
          </div>
          <div className="space-y-2">
            {recentSermons.length === 0 ? (
              <div className="admin-empty-state py-8">No sermons yet. Add or publish one to see it here.</div>
            ) : recentSermons.map((sermon) => (
              <div key={sermon._key} className="admin-surface-muted flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{sermon.title}</p>
                  <p className="text-xs text-muted-foreground">{sermon.speaker} · {sermon.date || 'No date'}</p>
                </div>
                <StatusBadge status={sermon.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="admin-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Upcoming Events</h2>
          <Link to="/admin/events" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
          </div>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <div className="admin-empty-state py-8">No events yet. Create one to start filling the calendar.</div>
            ) : recentEvents.map((event) => (
              <div key={event._key} className="admin-surface-muted flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.eventType === 'recurring' ? event.recurringLabel || 'Recurring' : event.date || 'No date'}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { to: '/admin/website/home', icon: Globe, label: 'Website Editor', description: 'Edit the main pages, images, and site-wide information.' },
          { to: '/admin/events', icon: Calendar, label: 'Events', description: 'Keep recurring gatherings and special events up to date.' },
          { to: '/admin/messages', icon: MessageSquare, label: 'Messages', description: 'Review contact form messages and prayer requests.' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="admin-surface group p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[1.05rem] bg-blue-500/10 text-blue-600">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              Open <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
