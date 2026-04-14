// @ts-nocheck
import SectionEditorPage from '@/pages/admin/SectionEditorPage';

export default function AdminAboutPage() {
  return (
    <SectionEditorPage
      title="About Page"
      subtitle="Leadership, Sunday expectations, directions, and Elim network details."
      sections={[
        { title: 'SEO', description: 'Metadata for the About page.', path: ['about', 'seo'] },
        { title: 'Header', description: 'Hero image and page introduction.', path: ['about', 'header'] },
        { title: 'Pastors', description: 'Leadership biography content.', path: ['about', 'pastors'] },
        { title: 'Sunday Expectations', description: 'Cards that explain what visitors can expect.', path: ['about', 'sundayExpectations'] },
        { title: 'Getting Here', description: 'Directions cards and embedded map.', path: ['about', 'gettingHere'] },
        { title: 'Elim Network', description: 'Connection to Elim Pentecostal Churches.', path: ['about', 'network'] },
      ]}
    />
  );
}
