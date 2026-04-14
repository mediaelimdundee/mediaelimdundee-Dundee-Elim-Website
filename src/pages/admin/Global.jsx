// @ts-nocheck
import PageHeader from '@/components/admin-portal/PageHeader';
import PublishControls from '@/components/admin-portal/PublishControls';
import EditorSection from '@/components/admin-portal/EditorSection';
import ImageUpload from '@/components/admin-portal/ImageUpload';
import SingletonSectionEditor from '@/components/admin-portal/SingletonSectionEditor';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function Field({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default function AdminGlobalPage() {
  const admin = useAdminPortal();
  const settings = admin.draftContent.settings;

  if (admin.loading) {
    return <div className="px-2 py-10 text-sm text-muted-foreground">Loading settings…</div>;
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Global Settings" subtitle="Site-wide church details, brand assets, and external links.">
        <PublishControls />
      </PageHeader>

      <div className="space-y-6">
        <EditorSection title="Church Info">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Church Name" value={settings.siteName} onChange={(value) => admin.updateValue(['settings', 'siteName'], value)} />
            <Field label="Short Name" value={settings.shortName} onChange={(value) => admin.updateValue(['settings', 'shortName'], value)} />
            <Field label="Tagline" value={settings.tagline} onChange={(value) => admin.updateValue(['settings', 'tagline'], value)} />
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-foreground">Footer Description</label>
            <Textarea value={settings.footerDescription || ''} onChange={(event) => admin.updateValue(['settings', 'footerDescription'], event.target.value)} rows={3} />
          </div>
        </EditorSection>

        <SingletonSectionEditor title="Contact Details" description="Public contact channels and address lines used across the website footer and contact page." path={['settings', 'contact']} />
        <SingletonSectionEditor title="External Links" description="Maps, YouTube, Facebook, giving, Elim, and safeguarding URLs." path={['settings', 'links']} />

        <EditorSection title="Branding">
          <div className="grid gap-6 md:grid-cols-2">
            <ImageUpload
              label="Logo"
              value={settings.branding.logo}
              busy={admin.uploadingPath === 'settings.branding.logo'}
              onUpload={(file) => admin.replaceMediaAtPath(['settings', 'branding', 'logo'], file)}
              onChange={(value) => admin.updateValue(['settings', 'branding', 'logo'], value)}
            />
            <ImageUpload
              label="Default SEO Image"
              value={settings.seo.defaultImage}
              busy={admin.uploadingPath === 'settings.seo.defaultImage'}
              onUpload={(file) => admin.replaceMediaAtPath(['settings', 'seo', 'defaultImage'], file)}
              onChange={(value) => admin.updateValue(['settings', 'seo', 'defaultImage'], value)}
            />
          </div>
        </EditorSection>

        <EditorSection title="Default SEO">
          <div className="grid gap-4">
            <Field label="Site URL" value={settings.seo.siteUrl} onChange={(value) => admin.updateValue(['settings', 'seo', 'siteUrl'], value)} placeholder="https://example.org" />
            <Field label="Default SEO Title" value={settings.seo.defaultTitle} onChange={(value) => admin.updateValue(['settings', 'seo', 'defaultTitle'], value)} />
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Default SEO Description</label>
              <Textarea value={settings.seo.defaultDescription || ''} onChange={(event) => admin.updateValue(['settings', 'seo', 'defaultDescription'], event.target.value)} rows={3} />
            </div>
          </div>
        </EditorSection>
      </div>
    </div>
  );
}
