// @ts-nocheck
import SectionEditorPage from '@/pages/admin/SectionEditorPage';

export default function AdminHomePage() {
  return (
    <SectionEditorPage
      title="Home Page"
      subtitle="Hero content, homepage sections, latest media, and weekly rhythm."
      sections={[
        { title: 'SEO', description: 'Metadata for search and social previews.', path: ['home', 'seo'] },
        { title: 'Hero', description: 'Headline, CTAs, and rotating hero slides.', path: ['home', 'hero'] },
        { title: 'Quick Info', description: 'Small cards beneath the hero.', path: ['home', 'quickInfo'] },
        { title: 'Pastors Section', description: 'Lead pastors copy, image, and supporting stats.', path: ['home', 'pastors'] },
        { title: 'Beliefs', description: 'Three foundation cards shown on the homepage.', path: ['home', 'beliefs'] },
        { title: 'Gallery', description: 'Top and bottom image grids.', path: ['home', 'gallery'] },
        { title: 'Featured Media', description: 'Latest YouTube section labels.', path: ['home', 'media'] },
        { title: 'Weekly Rhythm', description: 'Recurring rhythms and weekly activities.', path: ['home', 'weeklyRhythm'] },
        { title: 'Prayer Request Section', description: 'Prayer request form copy and labels.', path: ['home', 'prayerRequest'] },
        { title: 'Final CTA', description: 'Closing invitation block on the homepage.', path: ['home', 'cta'] },
      ]}
    />
  );
}
