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

const EMPTY_INFO_CARD = {
  kind: 'address',
  title: '',
  descriptionLines: [],
  items: [],
  linkLabel: '',
  linkUrl: '',
};

const EMPTY_CARD_ITEM = {
  label: '',
  value: '',
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

export default function AdminContactPage() {
  const admin = useAdminPortal();
  const contact = admin.draftContent.contact;

  if (admin.loading) {
    return <div className="px-2 py-10 text-sm text-muted-foreground">Loading content…</div>;
  }

  function update(path, value) {
    admin.updateValue(['contact', ...path], value);
  }

  function updateCard(index, key, value) {
    update(['infoCards'], contact.infoCards.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  }

  function addCard() {
    update(['infoCards'], [...contact.infoCards, { ...EMPTY_INFO_CARD }]);
  }

  function removeCard(index) {
    update(['infoCards'], contact.infoCards.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateCardItem(cardIndex, itemIndex, key, value) {
    updateCard(cardIndex, 'items', (contact.infoCards[cardIndex].items || []).map((item, currentIndex) => (
      currentIndex === itemIndex ? { ...item, [key]: value } : item
    )));
  }

  function addCardItem(cardIndex) {
    updateCard(cardIndex, 'items', [...(contact.infoCards[cardIndex].items || []), { ...EMPTY_CARD_ITEM }]);
  }

  function removeCardItem(cardIndex, itemIndex) {
    updateCard(cardIndex, 'items', (contact.infoCards[cardIndex].items || []).filter((_, currentIndex) => currentIndex !== itemIndex));
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Contact Page" subtitle="Edit the contact page content.">
        <PublishControls />
      </PageHeader>

      <div className="space-y-6">
        <EditorSection title="SEO">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Page Title" value={contact.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
            <AreaField label="Meta Description" value={contact.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
          </div>
        </EditorSection>

        <EditorSection title="Page Header">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow" value={contact.header.eyebrow} onChange={(value) => update(['header', 'eyebrow'], value)} />
            <Field label="Title Lead" value={contact.header.titleLead} onChange={(value) => update(['header', 'titleLead'], value)} />
            <Field label="Title Highlight" value={contact.header.titleHighlight} onChange={(value) => update(['header', 'titleHighlight'], value)} />
          </div>
          <AreaField label="Description" value={contact.header.description} onChange={(value) => update(['header', 'description'], value)} rows={3} />
          <ImageUpload
            label="Header Image"
            value={contact.header.image}
            busy={admin.uploadingPath === 'contact.header.image'}
            onUpload={(file) => admin.replaceMediaAtPath(['contact', 'header', 'image'], file)}
            onChange={(value) => update(['header', 'image'], value)}
          />
        </EditorSection>

        <EditorSection title="Contact Info Cards">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">Cards</div>
            <Button variant="outline" size="sm" className="gap-1" onClick={addCard}>
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </Button>
          </div>

          <div className="space-y-4">
            {contact.infoCards.length === 0 ? <p className="text-sm text-muted-foreground">No contact cards yet.</p> : null}

            {contact.infoCards.map((card, cardIndex) => (
              <div key={`${card.kind}-${cardIndex}`} className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Card {cardIndex + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeCard(cardIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Kind</label>
                    <Select value={card.kind} onValueChange={(value) => updateCard(cardIndex, 'kind', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="address">Address</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Title" value={card.title} onChange={(value) => updateCard(cardIndex, 'title', value)} />
                </div>

                <AreaField
                  label="Description Lines"
                  value={(card.descriptionLines || []).join('\n')}
                  onChange={(value) => updateCard(cardIndex, 'descriptionLines', value.split('\n').map((line) => line.trim()).filter(Boolean))}
                  rows={4}
                />

                <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Card Items</span>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => addCardItem(cardIndex)}>
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  </div>

                  {(card.items || []).length === 0 ? <p className="text-sm text-muted-foreground">No label/value items yet.</p> : null}

                  {(card.items || []).map((item, itemIndex) => (
                    <div key={`${item.label}-${itemIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <Field label="Label" value={item.label} onChange={(value) => updateCardItem(cardIndex, itemIndex, 'label', value)} />
                      <Field label="Value" value={item.value} onChange={(value) => updateCardItem(cardIndex, itemIndex, 'value', value)} />
                      <div className="flex items-end">
                        <Button variant="ghost" size="icon" onClick={() => removeCardItem(cardIndex, itemIndex)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Link Label" value={card.linkLabel} onChange={(value) => updateCard(cardIndex, 'linkLabel', value)} />
                  <Field label="Link URL" value={card.linkUrl} onChange={(value) => updateCard(cardIndex, 'linkUrl', value)} placeholder="https://..." />
                </div>
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Contact Form Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Form Title" value={contact.form.title} onChange={(value) => update(['form', 'title'], value)} />
            <Field label="Submit Button Label" value={contact.form.submitLabel} onChange={(value) => update(['form', 'submitLabel'], value)} />
            <Field label="Success Title" value={contact.form.successTitle} onChange={(value) => update(['form', 'successTitle'], value)} />
            <Field label="Reset Label" value={contact.form.resetLabel} onChange={(value) => update(['form', 'resetLabel'], value)} />
          </div>
          <AreaField label="Success Description" value={contact.form.successDescription} onChange={(value) => update(['form', 'successDescription'], value)} rows={3} />
        </EditorSection>

        <EditorSection title="Map">
          <Field label="Map Embed URL" value={contact.mapEmbedUrl} onChange={(value) => update(['mapEmbedUrl'], value)} placeholder="https://www.google.com/maps/embed?..." />
        </EditorSection>
      </div>
    </div>
  );
}
