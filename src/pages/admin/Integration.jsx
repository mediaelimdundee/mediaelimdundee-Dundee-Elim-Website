// @ts-nocheck
import PageHeader from '@/components/admin-portal/PageHeader';

const FETCH_HELPER = `import { fetchPublishedContent } from '@/lib/siteContentApi';

const published = await fetchPublishedContent();
console.log(published.content);`;

const STORAGE_MODEL = `Tables:
- site_content_versions
- contact_submissions
- prayer_submissions
- sermon_extraction_jobs

Storage bucket:
- site-media`;

const RULES = [
  'The public site reads only the published row from `site_content_versions`.',
  'Draft edits stay private until you click Publish inside the admin.',
  'Contact and prayer submissions are never included in published site content.',
  'Images are stored in Supabase Storage and referenced by public URL inside the content JSON.',
  'Sermon extraction jobs are queued in Supabase, dispatched from Netlify, and processed by GitHub Actions.',
];

export default function AdminIntegrationPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader title="Integration" subtitle="How this integrated admin connects to the standalone website without Base44." />

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-foreground">Current Setup</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This admin is now part of the same Vite project as the public website. It uses the existing Supabase backend directly, not Base44.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted p-4 text-xs leading-6 text-emerald-700">{STORAGE_MODEL}</pre>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-foreground">Published Content Access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The public site already uses the published snapshot helper below. Any future external site should follow the same published-only rule.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted p-4 text-xs leading-6 text-emerald-700">{FETCH_HELPER}</pre>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-foreground">Rules</h2>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            {RULES.map((rule) => <li key={rule}>• {rule}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
