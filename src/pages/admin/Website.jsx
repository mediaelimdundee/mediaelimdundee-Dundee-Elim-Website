// @ts-nocheck
import { NavLink, Navigate, useParams } from 'react-router-dom';
import { Info, Plus, Trash2 } from 'lucide-react';
import EditorSection from '@/components/admin-portal/EditorSection';
import ImageUpload from '@/components/admin-portal/ImageUpload';
import PageHeader from '@/components/admin-portal/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { cn } from '@/lib/utils';

const WEBSITE_SECTIONS = [
  {
    key: 'global',
    label: 'Global',
    title: 'Global Settings',
    subtitle: 'Church details, branding, external links, and default SEO.',
  },
  {
    key: 'home',
    label: 'Home',
    title: 'Home Page',
    subtitle: 'Hero, homepage cards, gallery, weekly rhythm, and prayer copy.',
  },
  {
    key: 'about',
    label: 'About',
    title: 'About Page',
    subtitle: 'Leadership, Sunday expectations, directions, and Elim network details.',
  },
  {
    key: 'give',
    label: 'Give',
    title: 'Give Page',
    subtitle: 'Giving options, scripture, Gift Aid, and impact cards.',
  },
  {
    key: 'contact',
    label: 'Contact',
    title: 'Contact Page',
    subtitle: 'Contact cards, form messaging, and map settings.',
  },
  {
    key: 'safeguarding',
    label: 'Safeguarding',
    title: 'Safeguarding Page',
    subtitle: 'Statement, resources, and safeguarding contact information.',
  },
];

const QUICK_INFO_OPTIONS = ['service', 'location', 'kids'];
const BELIEF_OPTIONS = ['worship', 'bible', 'community'];
const GETTING_HERE_OPTIONS = ['address', 'car', 'bus'];
const RESOURCE_OPTIONS = ['elim', 'report', 'policy'];

function createEmptyMedia() {
  return { path: '', url: '', alt: '' };
}

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

function splitLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function replaceItem(items, index, nextItem) {
  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

function removeItem(items, index) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function SectionTabs({ activeKey }) {
  return (
    <div className="admin-chip-set mb-6">
      {WEBSITE_SECTIONS.map((section) => (
        <NavLink
          key={section.key}
          to={`/admin/website/${section.key}`}
          className={({ isActive }) => cn(
            'admin-chip',
            isActive || activeKey === section.key
              ? 'admin-chip-active'
              : '',
          )}
        >
          {section.label}
        </NavLink>
      ))}
    </div>
  );
}

function EmptyHint({ text }) {
  return <div className="admin-empty-state py-6">{text}</div>;
}

function MediaArrayEditor({ title, items, onChange, onUpload, addLabel = 'Add image' }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => onChange([...(items || []), createEmptyMedia()])}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>

      {items.length === 0 ? <EmptyHint text="No images added yet." /> : null}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="admin-surface-muted space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Image {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => onChange(removeItem(items, index))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <ImageUpload
              label="Image"
              value={item}
              busy={false}
              onUpload={(file) => onUpload(index, file)}
              onChange={(value) => onChange(replaceItem(items, index, value))}
            />

            <Field
              label="Alt Text"
              value={item.alt}
              onChange={(value) => onChange(replaceItem(items, index, { ...item, alt: value }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalEditor({ admin }) {
  const settings = admin.draftContent.settings;

  function update(path, value) {
    admin.updateValue(['settings', ...path], value);
  }

  return (
    <div className="space-y-6">
      <EditorSection title="Church Information" description="The main details shown across the website and footer.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Church Name" value={settings.siteName} onChange={(value) => update(['siteName'], value)} />
          <Field label="Short Name" value={settings.shortName} onChange={(value) => update(['shortName'], value)} />
          <Field label="Tagline" value={settings.tagline} onChange={(value) => update(['tagline'], value)} />
        </div>
        <AreaField label="Footer Description" value={settings.footerDescription} onChange={(value) => update(['footerDescription'], value)} rows={3} />
      </EditorSection>

      <EditorSection title="Contact Details" description="Public contact information for the footer and contact page.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email" value={settings.contact.email} onChange={(value) => update(['contact', 'email'], value)} />
          <Field label="Phone Number" value={settings.contact.phoneDisplay} onChange={(value) => update(['contact', 'phoneDisplay'], value)} />
          <Field label="Phone Link Value" value={settings.contact.phoneHref} onChange={(value) => update(['contact', 'phoneHref'], value)} placeholder="01382226020" />
          <Field label="Address Line 1" value={settings.contact.addressLine1} onChange={(value) => update(['contact', 'addressLine1'], value)} />
          <Field label="Address Line 2" value={settings.contact.addressLine2} onChange={(value) => update(['contact', 'addressLine2'], value)} />
          <Field label="Short Address" value={settings.contact.addressShort} onChange={(value) => update(['contact', 'addressShort'], value)} />
        </div>
      </EditorSection>

      <EditorSection title="Branding" description="Logo and default sharing image used across the site.">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUpload
            label="Logo"
            value={settings.branding.logo}
            busy={admin.uploadingPath === 'settings.branding.logo'}
            onUpload={(file) => admin.replaceMediaAtPath(['settings', 'branding', 'logo'], file)}
            onChange={(value) => update(['branding', 'logo'], value)}
          />
          <ImageUpload
            label="Default SEO Image"
            value={settings.seo.defaultImage}
            busy={admin.uploadingPath === 'settings.seo.defaultImage'}
            onUpload={(file) => admin.replaceMediaAtPath(['settings', 'seo', 'defaultImage'], file)}
            onChange={(value) => update(['seo', 'defaultImage'], value)}
          />
        </div>
      </EditorSection>

      <EditorSection title="Website Links" description="Maps, YouTube, giving, safeguarding, and other external links.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Google Maps Link" value={settings.links.mapsUrl} onChange={(value) => update(['links', 'mapsUrl'], value)} placeholder="https://maps.google.com/..." />
          <Field label="Map Embed Link" value={settings.links.mapsEmbedUrl} onChange={(value) => update(['links', 'mapsEmbedUrl'], value)} placeholder="https://www.google.com/maps/embed?..." />
          <Field label="YouTube Channel ID" value={settings.links.youtubeChannelId} onChange={(value) => update(['links', 'youtubeChannelId'], value)} />
          <Field label="YouTube Channel Link" value={settings.links.youtubeUrl} onChange={(value) => update(['links', 'youtubeUrl'], value)} placeholder="https://youtube.com/..." />
          <Field label="Facebook Link" value={settings.links.facebookUrl} onChange={(value) => update(['links', 'facebookUrl'], value)} placeholder="https://facebook.com/..." />
          <Field label="Elim Link" value={settings.links.elimUrl} onChange={(value) => update(['links', 'elimUrl'], value)} placeholder="https://elim.org.uk" />
          <Field label="Online Giving Link" value={settings.links.onlineGivingUrl} onChange={(value) => update(['links', 'onlineGivingUrl'], value)} placeholder="https://..." />
          <Field label="Gift Aid Form Link" value={settings.links.giftAidFormUrl} onChange={(value) => update(['links', 'giftAidFormUrl'], value)} placeholder="https://..." />
          <Field label="Safeguarding Policy Link" value={settings.links.safeguardingPolicyUrl} onChange={(value) => update(['links', 'safeguardingPolicyUrl'], value)} placeholder="https://..." />
          <Field label="Report a Concern Link" value={settings.links.safeguardingConcernUrl} onChange={(value) => update(['links', 'safeguardingConcernUrl'], value)} placeholder="https://..." />
          <Field label="Elim Safeguarding Link" value={settings.links.elimSafeguardingUrl} onChange={(value) => update(['links', 'elimSafeguardingUrl'], value)} placeholder="https://..." />
        </div>
      </EditorSection>

      <EditorSection title="Default SEO" description="Fallback title, description, and URL for the public site.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Website URL" value={settings.seo.siteUrl} onChange={(value) => update(['seo', 'siteUrl'], value)} placeholder="https://example.org" />
          <Field label="Default SEO Title" value={settings.seo.defaultTitle} onChange={(value) => update(['seo', 'defaultTitle'], value)} />
        </div>
        <AreaField label="Default SEO Description" value={settings.seo.defaultDescription} onChange={(value) => update(['seo', 'defaultDescription'], value)} rows={3} />
      </EditorSection>
    </div>
  );
}

function HomeEditor({ admin }) {
  const home = admin.draftContent.home;

  function update(path, value) {
    admin.updateValue(['home', ...path], value);
  }

  return (
    <div className="space-y-6">
      <EditorSection title="Search and Sharing" description="Title and description used by search engines and link previews.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page Title" value={home.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
          <AreaField label="Page Description" value={home.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
        </div>
      </EditorSection>

      <EditorSection title="Hero Section" description="Main welcome message, buttons, and service badge.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={home.hero.eyebrow} onChange={(value) => update(['hero', 'eyebrow'], value)} />
          <Field label="Title Lead" value={home.hero.titleLead} onChange={(value) => update(['hero', 'titleLead'], value)} />
          <Field label="Title Highlight" value={home.hero.titleHighlight} onChange={(value) => update(['hero', 'titleHighlight'], value)} />
          <Field label="Primary Button Label" value={home.hero.primaryCtaLabel} onChange={(value) => update(['hero', 'primaryCtaLabel'], value)} />
          <Field label="Primary Button Link" value={home.hero.primaryCtaPath} onChange={(value) => update(['hero', 'primaryCtaPath'], value)} placeholder="/about" />
          <Field label="Secondary Button Label" value={home.hero.secondaryCtaLabel} onChange={(value) => update(['hero', 'secondaryCtaLabel'], value)} />
          <Field label="Secondary Button Link" value={home.hero.secondaryCtaPath} onChange={(value) => update(['hero', 'secondaryCtaPath'], value)} placeholder="/sermons" />
          <Field label="Badge Label" value={home.hero.serviceBadgeLabel} onChange={(value) => update(['hero', 'serviceBadgeLabel'], value)} />
          <Field label="Service Day" value={home.hero.serviceBadgeDay} onChange={(value) => update(['hero', 'serviceBadgeDay'], value)} />
          <Field label="Service Time" value={home.hero.serviceBadgeTime} onChange={(value) => update(['hero', 'serviceBadgeTime'], value)} />
          <Field label="Scroll Label" value={home.hero.scrollLabel} onChange={(value) => update(['hero', 'scrollLabel'], value)} />
        </div>
        <AreaField label="Hero Description" value={home.hero.description} onChange={(value) => update(['hero', 'description'], value)} rows={4} />
      </EditorSection>

      <EditorSection title="Hero Slides" description="Background images shown on the homepage hero.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Slides</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => update(['hero', 'slides'], [...home.hero.slides, { image: createEmptyMedia(), caption: '' }])}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Slide
            </Button>
          </div>

          {home.hero.slides.length === 0 ? <EmptyHint text="No hero slides yet." /> : null}

          {home.hero.slides.map((slide, index) => (
            <div key={`slide-${index}`} className="admin-surface-muted space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Slide {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => update(['hero', 'slides'], removeItem(home.hero.slides, index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <ImageUpload
                label="Slide Image"
                value={slide.image}
                busy={admin.uploadingPath === `home.hero.slides.${index}.image`}
                onUpload={(file) => admin.replaceMediaAtPath(['home', 'hero', 'slides', index, 'image'], file)}
                onChange={(value) => update(['hero', 'slides'], replaceItem(home.hero.slides, index, { ...slide, image: value }))}
              />
              <Field label="Slide Caption" value={slide.caption} onChange={(value) => update(['hero', 'slides'], replaceItem(home.hero.slides, index, { ...slide, caption: value }))} />
              <Field label="Alt Text" value={slide.image.alt} onChange={(value) => update(['hero', 'slides'], replaceItem(home.hero.slides, index, { ...slide, image: { ...slide.image, alt: value } }))} />
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Quick Info Cards" description="Small cards shown beneath the hero.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Cards</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['quickInfo', 'items'], [...home.quickInfo.items, { kind: 'service', title: '', sub: '' }])}>
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </Button>
          </div>

          {home.quickInfo.items.length === 0 ? <EmptyHint text="No quick info cards yet." /> : null}

          {home.quickInfo.items.map((item, index) => (
            <div key={`quick-info-${index}`} className="admin-surface-muted grid gap-4 p-4 md:grid-cols-[180px_1fr_1fr_auto]">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Type</label>
                <Select value={item.kind} onValueChange={(value) => update(['quickInfo', 'items'], replaceItem(home.quickInfo.items, index, { ...item, kind: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUICK_INFO_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Title" value={item.title} onChange={(value) => update(['quickInfo', 'items'], replaceItem(home.quickInfo.items, index, { ...item, title: value }))} />
              <Field label="Subtext" value={item.sub} onChange={(value) => update(['quickInfo', 'items'], replaceItem(home.quickInfo.items, index, { ...item, sub: value }))} />
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => update(['quickInfo', 'items'], removeItem(home.quickInfo.items, index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Pastors Section" description="Welcome text, image, stats, and link to the About page.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={home.pastors.eyebrow} onChange={(value) => update(['pastors', 'eyebrow'], value)} />
          <Field label="Title Lead" value={home.pastors.titleLead} onChange={(value) => update(['pastors', 'titleLead'], value)} />
          <Field label="Title Highlight" value={home.pastors.titleHighlight} onChange={(value) => update(['pastors', 'titleHighlight'], value)} />
          <Field label="Image Title" value={home.pastors.imageTitle} onChange={(value) => update(['pastors', 'imageTitle'], value)} />
          <Field label="Image Subtitle" value={home.pastors.imageSubtitle} onChange={(value) => update(['pastors', 'imageSubtitle'], value)} />
          <Field label="Button Label" value={home.pastors.ctaLabel} onChange={(value) => update(['pastors', 'ctaLabel'], value)} />
          <Field label="Button Link" value={home.pastors.ctaPath} onChange={(value) => update(['pastors', 'ctaPath'], value)} placeholder="/about" />
        </div>
        <AreaField
          label="Paragraphs"
          value={(home.pastors.paragraphs || []).join('\n')}
          onChange={(value) => update(['pastors', 'paragraphs'], splitLines(value))}
          rows={5}
          placeholder="One paragraph per line"
        />
        <ImageUpload
          label="Pastors Image"
          value={home.pastors.image}
          busy={admin.uploadingPath === 'home.pastors.image'}
          onUpload={(file) => admin.replaceMediaAtPath(['home', 'pastors', 'image'], file)}
          onChange={(value) => update(['pastors', 'image'], value)}
        />

        <div className="admin-surface-muted space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Stats</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['pastors', 'stats'], [...home.pastors.stats, { value: '', label: '' }])}>
              <Plus className="h-3.5 w-3.5" />
              Add Stat
            </Button>
          </div>

          {home.pastors.stats.length === 0 ? <EmptyHint text="No stats yet." /> : null}

          {home.pastors.stats.map((item, index) => (
            <div key={`stat-${index}`} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Field label="Value" value={item.value} onChange={(value) => update(['pastors', 'stats'], replaceItem(home.pastors.stats, index, { ...item, value }))} />
              <Field label="Label" value={item.label} onChange={(value) => update(['pastors', 'stats'], replaceItem(home.pastors.stats, index, { ...item, label: value }))} />
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => update(['pastors', 'stats'], removeItem(home.pastors.stats, index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Beliefs Cards" description="Three foundation cards shown on the homepage.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={home.beliefs.eyebrow} onChange={(value) => update(['beliefs', 'eyebrow'], value)} />
          <Field label="Section Title" value={home.beliefs.title} onChange={(value) => update(['beliefs', 'title'], value)} />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Belief Cards</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['beliefs', 'items'], [...home.beliefs.items, { kind: 'worship', title: '', description: '' }])}>
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </Button>
          </div>

          {home.beliefs.items.length === 0 ? <EmptyHint text="No belief cards yet." /> : null}

          {home.beliefs.items.map((item, index) => (
            <div key={`belief-${index}`} className="admin-surface-muted space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Icon Style</label>
                  <Select value={item.kind} onValueChange={(value) => update(['beliefs', 'items'], replaceItem(home.beliefs.items, index, { ...item, kind: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BELIEF_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Title" value={item.title} onChange={(value) => update(['beliefs', 'items'], replaceItem(home.beliefs.items, index, { ...item, title: value }))} />
              </div>
              <AreaField label="Description" value={item.description} onChange={(value) => update(['beliefs', 'items'], replaceItem(home.beliefs.items, index, { ...item, description: value }))} rows={3} />
              <Button variant="ghost" size="sm" onClick={() => update(['beliefs', 'items'], removeItem(home.beliefs.items, index))}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Remove Card
              </Button>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Gallery" description="Photo grids shown in the community section.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={home.gallery.eyebrow} onChange={(value) => update(['gallery', 'eyebrow'], value)} />
          <Field label="Section Title" value={home.gallery.title} onChange={(value) => update(['gallery', 'title'], value)} />
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <MediaArrayEditor
            title="Top Images"
            items={home.gallery.topImages}
            onChange={(value) => update(['gallery', 'topImages'], value)}
            onUpload={(index, file) => admin.replaceMediaAtPath(['home', 'gallery', 'topImages', index], file)}
          />
          <MediaArrayEditor
            title="Bottom Images"
            items={home.gallery.bottomImages}
            onChange={(value) => update(['gallery', 'bottomImages'], value)}
            onUpload={(index, file) => admin.replaceMediaAtPath(['home', 'gallery', 'bottomImages', index], file)}
          />
        </div>
      </EditorSection>

      <EditorSection title="Latest Video Section" description="This section’s text is editable here. The video list itself comes automatically from the YouTube channel ID in Global settings.">
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Update the YouTube Channel ID in Global settings if you want a different video source. Editors do not manage video sermons here anymore.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={home.media.eyebrow} onChange={(value) => update(['media', 'eyebrow'], value)} />
          <Field label="Section Title" value={home.media.title} onChange={(value) => update(['media', 'title'], value)} />
          <Field label="Subscribe Label" value={home.media.subscribeLabel} onChange={(value) => update(['media', 'subscribeLabel'], value)} />
          <Field label="View All Label" value={home.media.viewAllLabel} onChange={(value) => update(['media', 'viewAllLabel'], value)} />
          <Field label="View All Link" value={home.media.viewAllPath} onChange={(value) => update(['media', 'viewAllPath'], value)} placeholder="/sermons" />
        </div>
      </EditorSection>

      <EditorSection title="Weekly Rhythm" description="Regular weekly activities shown on the homepage.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Section Title" value={home.weeklyRhythm.title} onChange={(value) => update(['weeklyRhythm', 'title'], value)} />
          <Field label="Footer Label" value={home.weeklyRhythm.footerLabel} onChange={(value) => update(['weeklyRhythm', 'footerLabel'], value)} />
          <Field label="Footer Link" value={home.weeklyRhythm.footerPath} onChange={(value) => update(['weeklyRhythm', 'footerPath'], value)} placeholder="/events" />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Weekly Items</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['weeklyRhythm', 'items'], [...home.weeklyRhythm.items, { day: '', time: '', name: '' }])}>
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>

          {home.weeklyRhythm.items.length === 0 ? <EmptyHint text="No weekly items yet." /> : null}

          {home.weeklyRhythm.items.map((item, index) => (
            <div key={`rhythm-${index}`} className="admin-surface-muted grid gap-4 p-4 md:grid-cols-[1fr_1fr_2fr_auto]">
              <Field label="Day" value={item.day} onChange={(value) => update(['weeklyRhythm', 'items'], replaceItem(home.weeklyRhythm.items, index, { ...item, day: value }))} />
              <Field label="Time" value={item.time} onChange={(value) => update(['weeklyRhythm', 'items'], replaceItem(home.weeklyRhythm.items, index, { ...item, time: value }))} />
              <Field label="Name" value={item.name} onChange={(value) => update(['weeklyRhythm', 'items'], replaceItem(home.weeklyRhythm.items, index, { ...item, name: value }))} />
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => update(['weeklyRhythm', 'items'], removeItem(home.weeklyRhythm.items, index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Prayer Request Section" description="Text used in the homepage prayer request form.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={home.prayerRequest.eyebrow} onChange={(value) => update(['prayerRequest', 'eyebrow'], value)} />
          <Field label="Title" value={home.prayerRequest.title} onChange={(value) => update(['prayerRequest', 'title'], value)} />
          <Field label="Success Title" value={home.prayerRequest.successTitle} onChange={(value) => update(['prayerRequest', 'successTitle'], value)} />
          <Field label="Reset Label" value={home.prayerRequest.resetLabel} onChange={(value) => update(['prayerRequest', 'resetLabel'], value)} />
          <Field label="Privacy Label" value={home.prayerRequest.privacyLabel} onChange={(value) => update(['prayerRequest', 'privacyLabel'], value)} />
          <Field label="Submit Button Label" value={home.prayerRequest.submitLabel} onChange={(value) => update(['prayerRequest', 'submitLabel'], value)} />
        </div>
        <AreaField label="Description" value={home.prayerRequest.description} onChange={(value) => update(['prayerRequest', 'description'], value)} rows={3} />
        <AreaField label="Success Description" value={home.prayerRequest.successDescription} onChange={(value) => update(['prayerRequest', 'successDescription'], value)} rows={3} />
        <AreaField label="Privacy Description" value={home.prayerRequest.privacyDescription} onChange={(value) => update(['prayerRequest', 'privacyDescription'], value)} rows={2} />
      </EditorSection>

      <EditorSection title="Final Call To Action" description="Closing invitation at the bottom of the homepage.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" value={home.cta.title} onChange={(value) => update(['cta', 'title'], value)} />
          <Field label="Primary Button Label" value={home.cta.primaryLabel} onChange={(value) => update(['cta', 'primaryLabel'], value)} />
          <Field label="Primary Button Link" value={home.cta.primaryPath} onChange={(value) => update(['cta', 'primaryPath'], value)} placeholder="/contact" />
          <Field label="Secondary Button Label" value={home.cta.secondaryLabel} onChange={(value) => update(['cta', 'secondaryLabel'], value)} />
          <Field label="Secondary Button Link" value={home.cta.secondaryUrl} onChange={(value) => update(['cta', 'secondaryUrl'], value)} placeholder="https://..." />
        </div>
        <AreaField label="Description" value={home.cta.description} onChange={(value) => update(['cta', 'description'], value)} rows={3} />
      </EditorSection>
    </div>
  );
}

function AboutEditor({ admin }) {
  const about = admin.draftContent.about;

  function update(path, value) {
    admin.updateValue(['about', ...path], value);
  }

  return (
    <div className="space-y-6">
      <EditorSection title="Search and Sharing" description="Title and description used by search engines and link previews.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page Title" value={about.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
          <AreaField label="Page Description" value={about.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
        </div>
      </EditorSection>

      <EditorSection title="Page Header" description="The opening section of the About page.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={about.header.eyebrow} onChange={(value) => update(['header', 'eyebrow'], value)} />
          <Field label="Title Lead" value={about.header.titleLead} onChange={(value) => update(['header', 'titleLead'], value)} />
          <Field label="Title Highlight" value={about.header.titleHighlight} onChange={(value) => update(['header', 'titleHighlight'], value)} />
        </div>
        <AreaField label="Description" value={about.header.description} onChange={(value) => update(['header', 'description'], value)} rows={3} />
        <ImageUpload
          label="Header Image"
          value={about.header.image}
          busy={admin.uploadingPath === 'about.header.image'}
          onUpload={(file) => admin.replaceMediaAtPath(['about', 'header', 'image'], file)}
          onChange={(value) => update(['header', 'image'], value)}
        />
      </EditorSection>

      <EditorSection title="Pastors Content" description="Leadership introduction and photo.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={about.pastors.eyebrow} onChange={(value) => update(['pastors', 'eyebrow'], value)} />
          <Field label="Title Lead" value={about.pastors.titleLead} onChange={(value) => update(['pastors', 'titleLead'], value)} />
          <Field label="Title Highlight" value={about.pastors.titleHighlight} onChange={(value) => update(['pastors', 'titleHighlight'], value)} />
        </div>
        <AreaField
          label="Paragraphs"
          value={(about.pastors.paragraphs || []).join('\n')}
          onChange={(value) => update(['pastors', 'paragraphs'], splitLines(value))}
          rows={5}
          placeholder="One paragraph per line"
        />
        <ImageUpload
          label="Pastors Image"
          value={about.pastors.image}
          busy={admin.uploadingPath === 'about.pastors.image'}
          onUpload={(file) => admin.replaceMediaAtPath(['about', 'pastors', 'image'], file)}
          onChange={(value) => update(['pastors', 'image'], value)}
        />
      </EditorSection>

      <EditorSection title="What To Expect On A Sunday" description="Cards explaining what visitors can expect.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Section Title" value={about.sundayExpectations.title} onChange={(value) => update(['sundayExpectations', 'title'], value)} />
          <AreaField label="Section Description" value={about.sundayExpectations.description} onChange={(value) => update(['sundayExpectations', 'description'], value)} rows={3} />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Expectation Cards</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['sundayExpectations', 'items'], [...about.sundayExpectations.items, { number: '', title: '', description: '' }])}>
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </Button>
          </div>

          {about.sundayExpectations.items.length === 0 ? <EmptyHint text="No cards yet." /> : null}

          {about.sundayExpectations.items.map((item, index) => (
            <div key={`expectation-${index}`} className="admin-surface-muted space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-[120px_1fr_auto]">
                <Field label="Number" value={item.number} onChange={(value) => update(['sundayExpectations', 'items'], replaceItem(about.sundayExpectations.items, index, { ...item, number: value }))} />
                <Field label="Title" value={item.title} onChange={(value) => update(['sundayExpectations', 'items'], replaceItem(about.sundayExpectations.items, index, { ...item, title: value }))} />
                <div className="flex items-end">
                  <Button variant="ghost" size="icon" onClick={() => update(['sundayExpectations', 'items'], removeItem(about.sundayExpectations.items, index))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <AreaField label="Description" value={item.description} onChange={(value) => update(['sundayExpectations', 'items'], replaceItem(about.sundayExpectations.items, index, { ...item, description: value }))} rows={3} />
            </div>
          ))}
        </div>

        <AreaField label="Note" value={about.sundayExpectations.note} onChange={(value) => update(['sundayExpectations', 'note'], value)} rows={3} />
      </EditorSection>

      <EditorSection title="Getting Here" description="Directions cards and the embedded map.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Section Title" value={about.gettingHere.title} onChange={(value) => update(['gettingHere', 'title'], value)} />
          <Field label="Map Embed URL" value={about.gettingHere.mapEmbedUrl} onChange={(value) => update(['gettingHere', 'mapEmbedUrl'], value)} placeholder="https://www.google.com/maps/embed?..." />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Direction Cards</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['gettingHere', 'cards'], [...about.gettingHere.cards, { kind: 'address', title: '', description: '', linkLabel: '', linkUrl: '' }])}>
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </Button>
          </div>

          {about.gettingHere.cards.length === 0 ? <EmptyHint text="No direction cards yet." /> : null}

          {about.gettingHere.cards.map((item, index) => (
            <div key={`getting-here-${index}`} className="admin-surface-muted space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Type</label>
                  <Select value={item.kind} onValueChange={(value) => update(['gettingHere', 'cards'], replaceItem(about.gettingHere.cards, index, { ...item, kind: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GETTING_HERE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Title" value={item.title} onChange={(value) => update(['gettingHere', 'cards'], replaceItem(about.gettingHere.cards, index, { ...item, title: value }))} />
              </div>
              <AreaField label="Description" value={item.description} onChange={(value) => update(['gettingHere', 'cards'], replaceItem(about.gettingHere.cards, index, { ...item, description: value }))} rows={4} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Link Label" value={item.linkLabel} onChange={(value) => update(['gettingHere', 'cards'], replaceItem(about.gettingHere.cards, index, { ...item, linkLabel: value }))} />
                <Field label="Link URL" value={item.linkUrl} onChange={(value) => update(['gettingHere', 'cards'], replaceItem(about.gettingHere.cards, index, { ...item, linkUrl: value }))} placeholder="https://..." />
              </div>
              <Button variant="ghost" size="sm" onClick={() => update(['gettingHere', 'cards'], removeItem(about.gettingHere.cards, index))}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Remove Card
              </Button>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Elim Network Section" description="The section explaining Dundee Elim’s wider church family connection.">
        <div className="grid gap-4">
          <Field label="Title" value={about.network.title} onChange={(value) => update(['network', 'title'], value)} />
          <AreaField label="Description" value={about.network.description} onChange={(value) => update(['network', 'description'], value)} rows={3} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Link Label" value={about.network.linkLabel} onChange={(value) => update(['network', 'linkLabel'], value)} />
            <Field label="Link URL" value={about.network.linkUrl} onChange={(value) => update(['network', 'linkUrl'], value)} placeholder="https://elim.org.uk" />
          </div>
        </div>
      </EditorSection>
    </div>
  );
}

function GiveEditor({ admin }) {
  const give = admin.draftContent.give;

  function update(path, value) {
    admin.updateValue(['give', ...path], value);
  }

  return (
    <div className="space-y-6">
      <EditorSection title="Search and Sharing" description="Title and description used by search engines and link previews.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page Title" value={give.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
          <AreaField label="Page Description" value={give.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
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
          <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['methods'], [...give.methods, { kind: 'online', title: '', description: '', ctaLabel: '', ctaUrl: '', contactEmail: '', contactPhone: '', addressLines: [] }])}>
            <Plus className="h-3.5 w-3.5" />
            Add Method
          </Button>
        </div>

        <div className="space-y-4">
          {give.methods.length === 0 ? <EmptyHint text="No giving methods yet." /> : null}

          {give.methods.map((method, index) => (
            <div key={`${method.kind}-${index}`} className="admin-surface-muted space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Method {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => update(['methods'], removeItem(give.methods, index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Kind</label>
                  <Select value={method.kind} onValueChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, kind: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="inperson">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Title" value={method.title} onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, title: value }))} />
              </div>

              <AreaField label="Description" value={method.description} onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, description: value }))} rows={3} />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="CTA Label" value={method.ctaLabel} onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, ctaLabel: value }))} />
                <Field label="CTA URL" value={method.ctaUrl} onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, ctaUrl: value }))} placeholder="https://..." />
                <Field label="Contact Email" value={method.contactEmail} onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, contactEmail: value }))} />
                <Field label="Contact Phone" value={method.contactPhone} onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, contactPhone: value }))} />
              </div>

              <AreaField
                label="Address Lines"
                value={(method.addressLines || []).join('\n')}
                onChange={(value) => update(['methods'], replaceItem(give.methods, index, { ...method, addressLines: splitLines(value) }))}
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
          <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['impact', 'items'], [...give.impact.items, { label: '', icon: '' }])}>
            <Plus className="h-3.5 w-3.5" />
            Add Card
          </Button>
        </div>

        <Field label="Section Title" value={give.impact.title} onChange={(value) => update(['impact', 'title'], value)} />

        <div className="mt-4 space-y-4">
          {give.impact.items.length === 0 ? <EmptyHint text="No impact cards yet." /> : null}

          {give.impact.items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="admin-surface-muted grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto]">
              <Field label="Label" value={item.label} onChange={(value) => update(['impact', 'items'], replaceItem(give.impact.items, index, { ...item, label: value }))} />
              <Field label="Icon" value={item.icon} onChange={(value) => update(['impact', 'items'], replaceItem(give.impact.items, index, { ...item, icon: value }))} placeholder="🙏" />
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => update(['impact', 'items'], removeItem(give.impact.items, index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
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
  );
}

function ContactEditor({ admin }) {
  const contact = admin.draftContent.contact;

  function update(path, value) {
    admin.updateValue(['contact', ...path], value);
  }

  return (
    <div className="space-y-6">
      <EditorSection title="Search and Sharing" description="Title and description used by search engines and link previews.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page Title" value={contact.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
          <AreaField label="Page Description" value={contact.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
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
          <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['infoCards'], [...contact.infoCards, { kind: 'address', title: '', descriptionLines: [], items: [], linkLabel: '', linkUrl: '' }])}>
            <Plus className="h-3.5 w-3.5" />
            Add Card
          </Button>
        </div>

        <div className="space-y-4">
          {contact.infoCards.length === 0 ? <EmptyHint text="No contact cards yet." /> : null}

          {contact.infoCards.map((card, cardIndex) => (
            <div key={`${card.kind}-${cardIndex}`} className="admin-surface-muted space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Card {cardIndex + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => update(['infoCards'], removeItem(contact.infoCards, cardIndex))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Kind</label>
                  <Select value={card.kind} onValueChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, { ...card, kind: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Title" value={card.title} onChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, { ...card, title: value }))} />
              </div>

              <AreaField
                label="Description Lines"
                value={(card.descriptionLines || []).join('\n')}
                onChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, { ...card, descriptionLines: splitLines(value) }))}
                rows={4}
              />

              <div className="admin-surface-muted space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Card Items</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, { ...card, items: [...(card.items || []), { label: '', value: '' }] }))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>

                {(card.items || []).length === 0 ? <EmptyHint text="No label/value items yet." /> : null}

                {(card.items || []).map((item, itemIndex) => (
                  <div key={`${item.label}-${itemIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <Field
                      label="Label"
                      value={item.label}
                      onChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, {
                        ...card,
                        items: replaceItem(card.items || [], itemIndex, { ...item, label: value }),
                      }))}
                    />
                    <Field
                      label="Value"
                      value={item.value}
                      onChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, {
                        ...card,
                        items: replaceItem(card.items || [], itemIndex, { ...item, value }),
                      }))}
                    />
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, {
                          ...card,
                          items: removeItem(card.items || [], itemIndex),
                        }))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Link Label" value={card.linkLabel} onChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, { ...card, linkLabel: value }))} />
                <Field label="Link URL" value={card.linkUrl} onChange={(value) => update(['infoCards'], replaceItem(contact.infoCards, cardIndex, { ...card, linkUrl: value }))} placeholder="https://..." />
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
  );
}

function SafeguardingEditor({ admin }) {
  const safeguarding = admin.draftContent.safeguarding;

  function update(path, value) {
    admin.updateValue(['safeguarding', ...path], value);
  }

  return (
    <div className="space-y-6">
      <EditorSection title="Search and Sharing" description="Title and description used by search engines and link previews.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page Title" value={safeguarding.seo.title} onChange={(value) => update(['seo', 'title'], value)} />
          <AreaField label="Page Description" value={safeguarding.seo.description} onChange={(value) => update(['seo', 'description'], value)} rows={3} />
        </div>
      </EditorSection>

      <EditorSection title="Page Header" description="Opening safeguarding message and image.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={safeguarding.header.eyebrow} onChange={(value) => update(['header', 'eyebrow'], value)} />
          <Field label="Title Lead" value={safeguarding.header.titleLead} onChange={(value) => update(['header', 'titleLead'], value)} />
          <Field label="Title Highlight" value={safeguarding.header.titleHighlight} onChange={(value) => update(['header', 'titleHighlight'], value)} />
        </div>
        <AreaField label="Description" value={safeguarding.header.description} onChange={(value) => update(['header', 'description'], value)} rows={3} />
        <ImageUpload
          label="Header Image"
          value={safeguarding.header.image}
          busy={admin.uploadingPath === 'safeguarding.header.image'}
          onUpload={(file) => admin.replaceMediaAtPath(['safeguarding', 'header', 'image'], file)}
          onChange={(value) => update(['header', 'image'], value)}
        />
      </EditorSection>

      <EditorSection title="Statement of Commitment" description="Main safeguarding statement shown on the public page.">
        <Field label="Section Title" value={safeguarding.statement.title} onChange={(value) => update(['statement', 'title'], value)} />
        <AreaField
          label="Paragraphs"
          value={(safeguarding.statement.paragraphs || []).join('\n')}
          onChange={(value) => update(['statement', 'paragraphs'], splitLines(value))}
          rows={7}
          placeholder="One paragraph per line"
        />
      </EditorSection>

      <EditorSection title="Key Resources" description="Cards linking to policies and reporting resources.">
        <div className="mb-4 flex items-center justify-between">
          <Field label="Section Title" value={safeguarding.resourcesTitle} onChange={(value) => update(['resourcesTitle'], value)} />
          <Button variant="outline" size="sm" className="gap-1" onClick={() => update(['resources'], [...safeguarding.resources, { kind: 'elim', title: '', description: '', ctaLabel: '', ctaUrl: '' }])}>
            <Plus className="h-3.5 w-3.5" />
            Add Resource
          </Button>
        </div>

        <div className="space-y-4">
          {safeguarding.resources.length === 0 ? <EmptyHint text="No resource cards yet." /> : null}

          {safeguarding.resources.map((item, index) => (
            <div key={`resource-${index}`} className="admin-surface-muted space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Type</label>
                  <Select value={item.kind} onValueChange={(value) => update(['resources'], replaceItem(safeguarding.resources, index, { ...item, kind: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RESOURCE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Title" value={item.title} onChange={(value) => update(['resources'], replaceItem(safeguarding.resources, index, { ...item, title: value }))} />
              </div>
              <AreaField label="Description" value={item.description} onChange={(value) => update(['resources'], replaceItem(safeguarding.resources, index, { ...item, description: value }))} rows={3} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Button Label" value={item.ctaLabel} onChange={(value) => update(['resources'], replaceItem(safeguarding.resources, index, { ...item, ctaLabel: value }))} />
                <Field label="Button Link" value={item.ctaUrl} onChange={(value) => update(['resources'], replaceItem(safeguarding.resources, index, { ...item, ctaUrl: value }))} placeholder="https://..." />
              </div>
              <Button variant="ghost" size="sm" onClick={() => update(['resources'], removeItem(safeguarding.resources, index))}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Remove Resource
              </Button>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Safeguarding Contact Call To Action" description="Final contact block at the bottom of the page.">
        <div className="grid gap-4">
          <Field label="Title" value={safeguarding.contact.title} onChange={(value) => update(['contact', 'title'], value)} />
          <AreaField label="Description" value={safeguarding.contact.description} onChange={(value) => update(['contact', 'description'], value)} rows={3} />
          <Field label="Button Label" value={safeguarding.contact.buttonLabel} onChange={(value) => update(['contact', 'buttonLabel'], value)} />
        </div>
      </EditorSection>
    </div>
  );
}

export default function AdminWebsitePage() {
  const admin = useAdminPortal();
  const { section = 'global' } = useParams();
  const currentSection = WEBSITE_SECTIONS.find((item) => item.key === section);

  if (!currentSection) {
    return <Navigate to="/admin/website/global" replace />;
  }

  if (admin.loading) {
    return <div className="px-2 py-10 text-sm text-muted-foreground">Loading content…</div>;
  }

  let editor = null;

  switch (section) {
    case 'global':
      editor = <GlobalEditor admin={admin} />;
      break;
    case 'home':
      editor = <HomeEditor admin={admin} />;
      break;
    case 'about':
      editor = <AboutEditor admin={admin} />;
      break;
    case 'give':
      editor = <GiveEditor admin={admin} />;
      break;
    case 'contact':
      editor = <ContactEditor admin={admin} />;
      break;
    case 'safeguarding':
      editor = <SafeguardingEditor admin={admin} />;
      break;
    default:
      editor = null;
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title={currentSection.title} subtitle={currentSection.subtitle} />
      <SectionTabs activeKey={section} />
      {editor}
    </div>
  );
}
