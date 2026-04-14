// @ts-nocheck
import { Plus, Trash2 } from 'lucide-react';
import EditorSection from '@/components/admin-portal/EditorSection';
import ImageUpload from '@/components/admin-portal/ImageUpload';
import PageHeader from '@/components/admin-portal/PageHeader';
import PublishControls from '@/components/admin-portal/PublishControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminPortal } from '@/contexts/AdminPortalContext';

const EMPTY_METHOD = {
  kind: 'online',
  title: '',
  description: '',
  ctaLabel: '',
  ctaUrl: '',
  contactEmail: '',
  contactPhone: '',
  addressLines: [],
};

const EMPTY_IMPACT_ITEM = {
  label: '',
  icon: '',
};

function Field({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function AreaField({ label, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Textarea value={value || ''} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} />
    </div>
  );
}

export default function AdminGivePage() {
  const admin = useAdminPortal();
  const give = admin.draftContent.give;

  if (admin.loading) {
    return <div className="px-2 py-10 text-sm text-muted-foreground">Loading content…</div>;
  }

  function update(path, value) {
    admin.updateValue(['give', ...path], value);
  }

  function updateMethod(index, key, value) {
    update(['methods'], give.methods.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  }

  function addMethod() {
    update(['methods'], [...give.methods, { ...EMPTY_METHOD }]);
  }

  function removeMethod(index) {
    update(['methods'], give.methods.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateImpact(index, key, value) {
    update(['impact', 'items'], give.impact.items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  }

  function addImpact() {
    update(['impact', 'items'], [...give.impact.items, { ...EMPTY_IMPACT_ITEM }]);
  }

  function removeImpact(index) {
    update(['impact', 'items'], give.impact.items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Give Page" subtitle="Edit the giving page content.">
        <PublishControls />
      </PageHeader>

      <div className="space-y-6">
        <EditorSection title="SEO">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Page Title" value={give.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
            <AreaField label="Meta Description" value={give.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
          </div>
        </EditorSection>

        <EditorSection title="Page Header">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow" value={give.header.eyebrow} onChange={(value) => update(['header', 'eyebrow'], value)} />
            <Field label="Title Lead" value={give.header.titleLead} onChange={(value) => update(['header', 'titleLead'], value)} />
            <Field label="Title Highlight" value={give.header.titleHighlight} onChange={(value) => update(['header', 'titleHighlight'], value)} />
            <Field label="Quote Citation" value={give.header.quoteCitation} onChange={(value) => update(['header', 'quoteCitation'], value)} />
          </div>
          <AreaField label="Header Quote" value={give.header.quote} onChange={(value) => update(['header', 'quote'], value)} rows={3} />
          <ImageUpload
            label="Header Image"
            value={give.header.image}
            busy={admin.uploadingPath === 'give.header.image'}
            onUpload={(file) => admin.replaceMediaAtPath(['give', 'header', 'image'], file)}
            onChange={(value) => update(['header', 'image'], value)}
          />
        </EditorSection>

        <EditorSection title="Scripture Quote">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Reference" value={give.scripture.citation} onChange={(value) => update(['scripture', 'citation'], value)} placeholder="2 Corinthians 9:7" />
          </div>
          <AreaField label="Scripture Text" value={give.scripture.quote} onChange={(value) => update(['scripture', 'quote'], value)} rows={3} />
        </EditorSection>

        <EditorSection title="Giving Methods" description="Online, standing order, and in-person options.">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">Methods</div>
            <Button variant="outline" size="sm" className="gap-1" onClick={addMethod}>
              <Plus className="h-3.5 w-3.5" />
              Add Method
            </Button>
          </div>

          <div className="space-y-4">
            {give.methods.length === 0 ? <p className="text-sm text-muted-foreground">No giving methods yet.</p> : null}

            {give.methods.map((method, index) => (
              <div key={`${method.kind}-${index}`} className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Method {index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeMethod(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Kind</label>
                    <Select value={method.kind} onValueChange={(value) => updateMethod(index, 'kind', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="inperson">In Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Title" value={method.title} onChange={(value) => updateMethod(index, 'title', value)} />
                </div>

                <AreaField label="Description" value={method.description} onChange={(value) => updateMethod(index, 'description', value)} rows={3} />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="CTA Label" value={method.ctaLabel} onChange={(value) => updateMethod(index, 'ctaLabel', value)} />
                  <Field label="CTA URL" value={method.ctaUrl} onChange={(value) => updateMethod(index, 'ctaUrl', value)} placeholder="https://..." />
                  <Field label="Contact Email" value={method.contactEmail} onChange={(value) => updateMethod(index, 'contactEmail', value)} />
                  <Field label="Contact Phone" value={method.contactPhone} onChange={(value) => updateMethod(index, 'contactPhone', value)} />
                </div>

                <AreaField
                  label="Address Lines"
                  value={(method.addressLines || []).join('\n')}
                  onChange={(value) => updateMethod(index, 'addressLines', value.split('\n').map((line) => line.trim()).filter(Boolean))}
                  rows={4}
                  placeholder={'Dundee Elim Church\n40 Dudhope Crescent Road\nDundee, DD1 5RR'}
                />
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Gift Aid">
          <div className="grid gap-4">
            <Field label="Heading" value={give.giftAid.title} onChange={(value) => update(['giftAid', 'title'], value)} />
            <AreaField label="Content" value={give.giftAid.description} onChange={(value) => update(['giftAid', 'description'], value)} rows={3} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="CTA Label" value={give.giftAid.ctaLabel} onChange={(value) => update(['giftAid', 'ctaLabel'], value)} />
              <Field label="CTA URL" value={give.giftAid.ctaUrl} onChange={(value) => update(['giftAid', 'ctaUrl'], value)} placeholder="https://..." />
            </div>
          </div>
        </EditorSection>

        <EditorSection title="Impact Cards">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">Cards</div>
            <Button variant="outline" size="sm" className="gap-1" onClick={addImpact}>
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </Button>
          </div>

          <Field label="Section Title" value={give.impact.title} onChange={(value) => update(['impact', 'title'], value)} />

          <div className="mt-4 space-y-4">
            {give.impact.items.length === 0 ? <p className="text-sm text-muted-foreground">No impact cards yet.</p> : null}

            {give.impact.items.map((item, index) => (
              <div key={`${item.label}-${index}`} className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Card {index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeImpact(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Label" value={item.label} onChange={(value) => updateImpact(index, 'label', value)} />
                  <Field label="Icon" value={item.icon} onChange={(value) => updateImpact(index, 'icon', value)} placeholder="🙏" />
                </div>
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Contact CTA">
          <div className="grid gap-4">
            <Field label="CTA Title" value={give.contactCta.title} onChange={(value) => update(['contactCta', 'title'], value)} />
            <AreaField label="CTA Description" value={give.contactCta.description} onChange={(value) => update(['contactCta', 'description'], value)} rows={3} />
          </div>
        </EditorSection>
      </div>
    </div>
  );
}
