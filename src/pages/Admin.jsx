import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, LogOut, RefreshCw, Save, SendHorizontal } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import MediaPanel from '@/components/admin/MediaPanel';
import RecursiveContentEditor from '@/components/admin/RecursiveContentEditor';
import SubmissionsPanel from '@/components/admin/SubmissionsPanel';
import { defaultSiteContent } from '@/content/defaultSiteContent';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import {
  addArrayItemAtPath,
  cloneValue,
  getValueAtPath,
  moveArrayItemAtPath,
  removeArrayItemAtPath,
  setValueAtPath,
} from '@/lib/contentEditorUtils';
import {
  fetchDraftContent,
  listSubmissions,
  publishDraftContent,
  saveDraftContent,
  updateSubmissionStatus,
  uploadMedia,
} from '@/lib/siteContentApi';

const sections = [
  { key: 'settings', label: 'Global', type: 'content', path: ['settings'], description: 'Site identity, contact details, links, branding, and default SEO.' },
  { key: 'home', label: 'Home', type: 'content', path: ['home'], description: 'Hero content, homepage sections, weekly rhythm, and calls to action.' },
  { key: 'about', label: 'About', type: 'content', path: ['about'], description: 'Leadership, Sunday expectations, directions, and network information.' },
  { key: 'sermons', label: 'Sermons', type: 'content', path: ['sermons'], description: 'Video and audio sermons plus page copy and YouTube labels.' },
  { key: 'events', label: 'Events', type: 'content', path: ['events'], description: 'Recurring event templates, special events, categories, and page copy.' },
  { key: 'ministries', label: 'Ministries', type: 'content', path: ['ministries'], description: 'Ministry cards, modal details, tags, icons, themes, and photo strip.' },
  { key: 'give', label: 'Give', type: 'content', path: ['give'], description: 'Giving page copy, methods, impact cards, and Gift Aid information.' },
  { key: 'contact', label: 'Contact', type: 'content', path: ['contact'], description: 'Contact cards, form success copy, and map content.' },
  { key: 'safeguarding', label: 'Safeguarding', type: 'content', path: ['safeguarding'], description: 'Statement, resource cards, and safeguarding contact content.' },
  { key: 'media', label: 'Media', type: 'media', description: 'Browse and replace every image reference used in the current draft.' },
  { key: 'submissions', label: 'Submissions', type: 'submissions', description: 'Review contact form messages and prayer requests from the live website.' },
];

function formatTimestamp(value) {
  if (!value) {
    return 'Not yet';
  }

  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Admin() {
  const auth = useAdminAuth();
  const { refreshContent } = useSiteContent();
  const [activeSection, setActiveSection] = useState('settings');
  const [draftContent, setDraftContent] = useState(() => cloneValue(defaultSiteContent));
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(defaultSiteContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPath, setUploadingPath] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draftMetadata, setDraftMetadata] = useState(null);
  const [publishedMetadata, setPublishedMetadata] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];
  const hasUnsavedChanges = useMemo(() => JSON.stringify(draftContent) !== savedSnapshot, [draftContent, savedSnapshot]);

  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    if (activeSection === 'submissions') {
      refreshSubmissions();
    }
  }, [activeSection, typeFilter, statusFilter]);

  async function loadDraft() {
    setLoading(true);
    setError('');

    try {
      const result = await fetchDraftContent();
      setDraftContent(cloneValue(result.content));
      setSavedSnapshot(JSON.stringify(result.content));
      setDraftMetadata(result.metadata);
      setPublishedMetadata(result.publishedMetadata || null);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load draft content.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshSubmissions() {
    setSubmissionsLoading(true);

    try {
      const nextSubmissions = await listSubmissions({
        type: typeFilter,
        status: statusFilter,
      });
      setSubmissions(nextSubmissions);
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to load submissions.');
    } finally {
      setSubmissionsLoading(false);
    }
  }

  function clearMessages() {
    setError('');
    setNotice('');
  }

  function updateValue(path, nextValue) {
    clearMessages();
    setDraftContent((current) => setValueAtPath(current, path, nextValue));
  }

  function addArrayItem(path, item) {
    clearMessages();
    setDraftContent((current) => addArrayItemAtPath(current, path, item));
  }

  function removeArrayItem(path, index) {
    clearMessages();
    setDraftContent((current) => removeArrayItemAtPath(current, path, index));
  }

  function moveArrayItem(path, fromIndex, toIndex) {
    if (toIndex < 0) {
      return;
    }

    clearMessages();
    setDraftContent((current) => moveArrayItemAtPath(current, path, fromIndex, toIndex));
  }

  async function handleUploadMedia(path, file) {
    setUploadingPath(path.join('.'));
    setError('');
    setNotice('');

    try {
      const mediaRef = await uploadMedia(file);
      setDraftContent((current) => setValueAtPath(current, path, mediaRef));
      setNotice(`Uploaded ${file.name}.`);
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload image.');
    } finally {
      setUploadingPath('');
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const result = await saveDraftContent(draftContent);
      setDraftContent(cloneValue(result.content));
      setSavedSnapshot(JSON.stringify(result.content));
      setDraftMetadata(result.draftMetadata);
      setPublishedMetadata(result.publishedMetadata || publishedMetadata);
      setNotice('Draft saved.');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save draft.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError('');
    setNotice('');

    try {
      if (hasUnsavedChanges) {
        const saveResult = await saveDraftContent(draftContent);
        setDraftContent(cloneValue(saveResult.content));
        setSavedSnapshot(JSON.stringify(saveResult.content));
        setDraftMetadata(saveResult.draftMetadata);
      }

      const result = await publishDraftContent();
      setDraftContent(cloneValue(result.content));
      setSavedSnapshot(JSON.stringify(result.content));
      setDraftMetadata(result.draftMetadata);
      setPublishedMetadata(result.publishedMetadata);
      await refreshContent();
      setNotice('Draft published to the live website.');
    } catch (publishError) {
      setError(publishError.message || 'Unable to publish draft.');
    } finally {
      setPublishing(false);
    }
  }

  async function handleReload() {
    setRefreshing(true);
    setNotice('');
    setError('');

    try {
      await loadDraft();
      if (activeSection === 'submissions') {
        await refreshSubmissions();
      }
      setNotice('Draft reloaded from Supabase.');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSubmissionStatus(type, id, status) {
    setError('');
    setNotice('');

    try {
      await updateSubmissionStatus(type, id, status);
      setNotice('Submission updated.');
      await refreshSubmissions();
    } catch (statusError) {
      setError(statusError.message || 'Unable to update submission.');
    }
  }

  async function handleSignOut() {
    try {
      await auth.signOut();
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out.');
    }
  }

  const sectionValue = currentSection.type === 'content'
    ? getValueAtPath(draftContent, currentSection.path)
    : null;
  const sectionTemplate = currentSection.type === 'content'
    ? getValueAtPath(defaultSiteContent, currentSection.path)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Admin" description="Standalone admin for Dundee Elim Church." path="/admin" />

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        <div className="lg-surface rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            <div>
              <div className="text-blue-300/70 text-xs uppercase tracking-[0.25em] mb-2">Standalone Admin</div>
              <h1 className="font-display text-4xl font-bold text-white">Content, Media, and Inbox</h1>
              <p className="text-white/50 mt-3 max-w-3xl text-sm">
                Shared login for managing the draft snapshot, publishing changes to the live site, uploading media, and reviewing public submissions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleReload} disabled={loading || refreshing} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-white/70 hover:text-white disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Reload
              </button>
              <button type="button" onClick={handleSaveDraft} disabled={loading || saving || publishing} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-blue-200 hover:text-white disabled:opacity-50" style={{ background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.24)' }}>
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handlePublish} disabled={loading || saving || publishing} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl lg-btn-primary disabled:opacity-50">
                {publishing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
              <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-white/60 hover:text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-white/35 text-xs uppercase tracking-wider mb-2">Draft Updated</div>
              <div className="text-white font-medium">{formatTimestamp(draftMetadata?.updatedAt)}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-white/35 text-xs uppercase tracking-wider mb-2">Published</div>
              <div className="text-white font-medium">{formatTimestamp(publishedMetadata?.publishedAt)}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-white/35 text-xs uppercase tracking-wider mb-2">Version</div>
              <div className="text-white font-medium">v{publishedMetadata?.version || draftMetadata?.version || 1}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-white/35 text-xs uppercase tracking-wider mb-2">Unsaved Changes</div>
              <div className={`font-medium ${hasUnsavedChanges ? 'text-amber-300' : 'text-green-300'}`}>{hasUnsavedChanges ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl px-4 py-3 text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
          {notice && (
            <div className="mt-5 rounded-2xl px-4 py-3 text-sm text-green-200" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
              {notice}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <aside className="lg-surface rounded-3xl p-4 h-fit xl:sticky xl:top-6">
            <div className="text-white/35 text-xs uppercase tracking-wider px-3 pt-2 pb-3">Sections</div>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${activeSection === section.key ? 'text-white' : 'text-white/55 hover:text-white'}`}
                  style={activeSection === section.key
                    ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="lg-surface rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold text-white">{currentSection.label}</h2>
              <p className="text-white/45 text-sm mt-2 max-w-3xl">{currentSection.description}</p>
            </div>

            {loading ? (
              <div className="rounded-2xl p-12 text-center text-white/50" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Loading draft content...
              </div>
            ) : currentSection.type === 'content' ? (
              <RecursiveContentEditor
                label={currentSection.label}
                value={sectionValue}
                path={currentSection.path}
                templateValue={sectionTemplate}
                onChangeValue={updateValue}
                onAddArrayItem={addArrayItem}
                onRemoveArrayItem={removeArrayItem}
                onMoveArrayItem={moveArrayItem}
                onUploadMedia={handleUploadMedia}
                uploadingPath={uploadingPath}
              />
            ) : currentSection.type === 'media' ? (
              <MediaPanel content={draftContent} onChangeValue={updateValue} onUploadMedia={handleUploadMedia} uploadingPath={uploadingPath} />
            ) : (
              <SubmissionsPanel
                submissions={submissions}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                onTypeFilterChange={setTypeFilter}
                onStatusFilterChange={setStatusFilter}
                onUpdateStatus={handleSubmissionStatus}
                loading={submissionsLoading}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
