// @ts-nocheck
import PageHeader from '@/components/admin-portal/PageHeader';
import PublishControls from '@/components/admin-portal/PublishControls';
import SingletonSectionEditor from '@/components/admin-portal/SingletonSectionEditor';
import { useAdminPortal } from '@/contexts/AdminPortalContext';

export default function SectionEditorPage({ title, subtitle, sections }) {
  const admin = useAdminPortal();

  if (admin.loading) {
    return <div className="px-2 py-10 text-sm text-muted-foreground">Loading content…</div>;
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title={title} subtitle={subtitle}>
        <PublishControls />
      </PageHeader>

      <div className="space-y-6">
        {sections.map((section) => (
          <SingletonSectionEditor
            key={section.path.join('.')}
            title={section.title}
            description={section.description}
            path={section.path}
          />
        ))}
      </div>
    </div>
  );
}
