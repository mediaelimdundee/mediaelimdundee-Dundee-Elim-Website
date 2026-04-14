// @ts-nocheck
import PageHeader from '@/components/admin-portal/PageHeader';

const MODEL_GROUPS = [
  {
    title: 'Published Snapshot',
    description: 'The website stores one draft row and one published row in the `site_content_versions` table. Each row contains the full site content JSON.',
    items: [
      'settings',
      'home',
      'about',
      'sermons',
      'events',
      'ministries',
      'give',
      'contact',
      'safeguarding',
    ],
  },
  {
    title: 'Collections Inside The Snapshot',
    description: 'These are editable lists inside that full-site JSON document.',
    items: [
      'sermons.videoSermons',
      'sermons.audioSermons',
      'sermons.podcast',
      'events.recurringTemplates',
      'events.specialEvents',
      'ministries.items',
      'ministries.photoStrip',
    ],
  },
  {
    title: 'Submissions',
    description: 'Public form submissions and background sermon extraction jobs are stored separately so they never appear inside the published site content snapshot.',
    items: [
      'contact_submissions',
      'prayer_submissions',
      'sermon_extraction_jobs',
    ],
  },
  {
    title: 'Media',
    description: 'Uploaded files are stored in the Supabase storage bucket `site-media`. Content records store public URLs and storage paths.',
    items: [
      'settings.branding.logo',
      'settings.seo.defaultImage',
      'sermons.podcast.coverArt',
      'home.hero.slides[*].image',
      'about.header.image',
      'events.specialEvents[*].image',
      'ministries.photoStrip[*]',
    ],
  },
];

export default function AdminDataModelsPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader title="Data Models" subtitle="The actual storage model used by this standalone admin and website." />

      <div className="grid gap-6">
        {MODEL_GROUPS.map((group) => (
          <section key={group.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-foreground">{group.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span key={item} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground/75">
                  {item}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
