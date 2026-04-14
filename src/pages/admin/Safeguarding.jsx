// @ts-nocheck
import SectionEditorPage from '@/pages/admin/SectionEditorPage';

export default function AdminSafeguardingPage() {
  return (
    <SectionEditorPage
      title="Safeguarding"
      subtitle="Safeguarding statement, key resources, and contact call to action."
      sections={[
        { title: 'SEO', description: 'Metadata for the Safeguarding page.', path: ['safeguarding', 'seo'] },
        { title: 'Header', description: 'Hero image and safeguarding introduction.', path: ['safeguarding', 'header'] },
        { title: 'Statement', description: 'Main safeguarding statement paragraphs.', path: ['safeguarding', 'statement'] },
        { title: 'Resources', description: 'Resource cards shown on the page.', path: ['safeguarding', 'resources'] },
        { title: 'Contact CTA', description: 'Safeguarding contact block.', path: ['safeguarding', 'contact'] },
      ]}
    />
  );
}
