// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle,
  Clock3,
  Copy,
  ExternalLink,
  Headphones,
  Loader2,
  Mic,
  Plus,
  Radio,
  RefreshCw,
  Rss,
  Search,
  Settings,
  Trash2,
  Upload,
  Youtube,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import EditorSection from '@/components/admin-portal/EditorSection';
import ImageUpload from '@/components/admin-portal/ImageUpload';
import PageHeader from '@/components/admin-portal/PageHeader';
import StatusBadge from '@/components/admin-portal/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { createAdminId } from '@/lib/adminPortalAdapters';
import { dispatchSermonExtraction, fetchSermonExtractionStatus } from '@/lib/sermonExtractionApi';
import {
  buildLatestJobMap,
  getExtractionStatusLabel,
  getExtractionStatusTone,
  isExtractionActiveStatus,
  validateTimecodeRange,
} from '@/lib/sermonExtraction';
import { normalizeSnapshotVideoSermons, useYoutubeSermons } from '@/lib/youtubeSermons';

const EMPTY_EPISODE = {
  id: '',
  title: '',
  speaker: '',
  series: '',
  date: '',
  description: '',
  audio_url: '',
  thumbnailUrl: '',
  youtube_url: '',
  start_time: '',
  end_time: '',
  scripture_reference: '',
  episode_number: '',
  show_notes: '',
  transcript: '',
  duration_seconds: '',
  status: 'draft',
  publishedAt: '',
};

const DISTRIBUTION_PLATFORMS = [
  {
    name: 'Spotify for Creators',
    url: 'https://podcasters.spotify.com/',
    steps: [
      'Create or sign in to your Spotify for Creators account.',
      'Choose the option to add an existing podcast by RSS feed.',
      'Paste your Dundee Elim feed URL and complete verification.',
    ],
  },
  {
    name: 'Apple Podcasts Connect',
    url: 'https://podcastsconnect.apple.com/',
    steps: [
      'Sign in with the Apple ID that manages podcast submissions.',
      'Add a new show and choose the RSS feed option.',
      'Submit the Dundee Elim feed URL for review.',
    ],
  },
  {
    name: 'Amazon Music / Audible',
    url: 'https://music.amazon.com/podcasts/submit',
    steps: [
      'Open the Amazon podcast submission form.',
      'Paste the RSS feed URL and follow the ownership prompts.',
      'Wait for Amazon approval and distribution.',
    ],
  },
  {
    name: 'YouTube Music / Google Podcasts Manager',
    url: 'https://podcastsmanager.google.com/',
    steps: [
      'Open Podcasts Manager with the Google account for the channel.',
      'Add the podcast RSS feed and verify ownership.',
      'Review the imported episodes once processing finishes.',
    ],
  },
];

function sortByDateDesc(left, right) {
  return String(right.date || '').localeCompare(String(left.date || ''));
}

function normalizeEpisodeForm(episode = {}) {
  return {
    ...EMPTY_EPISODE,
    ...episode,
    episode_number: episode?.episode_number ?? '',
    duration_seconds: episode?.duration_seconds ?? '',
    status: episode?.status || 'draft',
    publishedAt: episode?.publishedAt || '',
  };
}

function formatEpisodeDate(value) {
  if (!value) {
    return 'No date';
  }

  try {
    return new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' });
  } catch {
    return value;
  }
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) {
    return 'No duration';
  }

  const wholeSeconds = Number(seconds);

  if (!Number.isFinite(wholeSeconds) || wholeSeconds < 0) {
    return 'No duration';
  }

  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainder = wholeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function getFeedBaseUrl(content) {
  const configuredUrl = content?.settings?.seo?.siteUrl || content?.sermons?.podcast?.website || '';

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

function getFeedUrl(content) {
  const baseUrl = getFeedBaseUrl(content);
  return baseUrl ? `${baseUrl}/.netlify/functions/podcast-rss` : '/.netlify/functions/podcast-rss';
}

function buildEpisodePayload(form, selectedId) {
  return {
    ...form,
    id: selectedId || form.id || createAdminId('audio'),
    title: form.title.trim(),
    speaker: form.speaker.trim(),
    series: form.series.trim(),
    description: form.description.trim(),
    audio_url: form.audio_url.trim(),
    thumbnailUrl: form.thumbnailUrl.trim(),
    youtube_url: form.youtube_url.trim(),
    start_time: form.start_time.trim(),
    end_time: form.end_time.trim(),
    scripture_reference: form.scripture_reference.trim(),
    show_notes: form.show_notes.trim(),
    transcript: form.transcript.trim(),
    episode_number: form.episode_number === '' ? null : Number(form.episode_number),
    duration_seconds: form.duration_seconds === '' ? null : Number(form.duration_seconds),
    status: form.status || 'draft',
    publishedAt: form.status === 'published'
      ? (form.publishedAt || new Date().toISOString())
      : '',
  };
}

function podcastChecklist(podcast, publishedCount) {
  const items = [];

  if (!podcast?.title?.trim()) {
    items.push('Add a podcast title.');
  }
  if (!podcast?.description?.trim()) {
    items.push('Add a podcast description.');
  }
  if (!podcast?.author?.trim()) {
    items.push('Set an author or speaker name.');
  }
  if (!podcast?.email?.trim()) {
    items.push('Add a contact email for podcast directories.');
  }
  if (!podcast?.website?.trim()) {
    items.push('Set the podcast website URL.');
  }
  if (!podcast?.coverArt?.url && !podcast?.coverArt?.path) {
    items.push('Upload podcast cover art.');
  }
  if (publishedCount === 0) {
    items.push('Publish at least one audio episode before submitting the feed.');
  }

  return items;
}

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="admin-surface p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function ExtractionJobBadge({ job }) {
  if (!job?.status) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getExtractionStatusTone(job.status)}`}>
      {isExtractionActiveStatus(job.status) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock3 className="h-3.5 w-3.5" />}
      {getExtractionStatusLabel(job.status)}
    </span>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Input
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function AdminSermonsPage() {
  const admin = useAdminPortal();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState('');
  const [episodeForm, setEpisodeForm] = useState(() => normalizeEpisodeForm());
  const [creatingEpisode, setCreatingEpisode] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [dispatchingEpisodeId, setDispatchingEpisodeId] = useState('');
  const [jobMap, setJobMap] = useState({});

  const youtubeFeed = useYoutubeSermons(admin.draftContent.settings.links.youtubeChannelId);
  const fallbackVideos = useMemo(
    () => normalizeSnapshotVideoSermons(admin.draftContent.sermons.videoSermons || []),
    [admin.draftContent.sermons.videoSermons],
  );
  const videos = youtubeFeed.videos.length > 0 ? youtubeFeed.videos : fallbackVideos;

  const audioEpisodes = useMemo(
    () => [...(admin.draftContent.sermons.audioSermons || [])].sort(sortByDateDesc),
    [admin.draftContent.sermons.audioSermons],
  );
  const podcast = admin.draftContent.sermons.podcast || {};
  const feedUrl = useMemo(() => getFeedUrl(admin.draftContent), [admin.draftContent]);
  const checklist = useMemo(
    () => podcastChecklist(podcast, audioEpisodes.filter((episode) => episode.status === 'published').length),
    [audioEpisodes, podcast],
  );

  const publishedEpisodes = useMemo(
    () => audioEpisodes.filter((episode) => episode.status === 'published'),
    [audioEpisodes],
  );
  const readyEpisodes = useMemo(
    () => audioEpisodes.filter((episode) => episode.status === 'ready'),
    [audioEpisodes],
  );
  const withAudioEpisodes = useMemo(
    () => audioEpisodes.filter((episode) => episode.audio_url),
    [audioEpisodes],
  );
  const activeExtractionJobs = useMemo(
    () => Object.values(jobMap).filter((job) => isExtractionActiveStatus(job.status)),
    [jobMap],
  );
  const selectedEpisodeJob = selectedEpisodeId ? jobMap[selectedEpisodeId] : null;
  const dispatchingSelectedEpisode = Boolean(
    dispatchingEpisodeId && dispatchingEpisodeId === (selectedEpisodeId || episodeForm.id || dispatchingEpisodeId),
  );
  const episodeIdsKey = useMemo(
    () => audioEpisodes.map((episode) => episode.id).filter(Boolean).join(','),
    [audioEpisodes],
  );

  const filteredEpisodes = useMemo(() => {
    return audioEpisodes.filter((episode) => {
      const matchesSearch = !search
        || episode.title?.toLowerCase().includes(search.toLowerCase())
        || episode.speaker?.toLowerCase().includes(search.toLowerCase())
        || episode.series?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || episode.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [audioEpisodes, search, statusFilter]);

  useEffect(() => {
    if (creatingEpisode) {
      return;
    }

    if (!selectedEpisodeId) {
      if (audioEpisodes[0]) {
        setSelectedEpisodeId(audioEpisodes[0].id);
      } else {
        setEpisodeForm(normalizeEpisodeForm());
      }
      return;
    }

    const selectedEpisode = audioEpisodes.find((episode) => episode.id === selectedEpisodeId);

    if (selectedEpisode) {
      setEpisodeForm(normalizeEpisodeForm(selectedEpisode));
      return;
    }

    if (audioEpisodes[0]) {
      setSelectedEpisodeId(audioEpisodes[0].id);
    } else {
      setSelectedEpisodeId('');
      setEpisodeForm(normalizeEpisodeForm());
    }
  }, [audioEpisodes, creatingEpisode, selectedEpisodeId]);

  useEffect(() => {
    const episodeIds = audioEpisodes.map((episode) => episode.id).filter(Boolean);

    if (episodeIds.length === 0) {
      setJobMap({});
      return undefined;
    }

    if (activeTab !== 'episodes' && activeExtractionJobs.length === 0) {
      return undefined;
    }

    let cancelled = false;

    async function loadJobs() {
      try {
        const result = await fetchSermonExtractionStatus({ episodeIds });
        const nextJobs = result.jobs || [];

        if (cancelled) {
          return;
        }

        setJobMap(buildLatestJobMap(nextJobs));
        const readyJobs = nextJobs.filter((job) => job?.status === 'ready' && job?.episode);

        const changedReadyJobs = readyJobs.filter((job) => {
          const currentEpisode = audioEpisodes.find((episode) => episode.id === job.episode?.id);

          if (!currentEpisode) {
            return false;
          }

          return (
            currentEpisode.audio_url !== job.episode.audio_url
            || currentEpisode.duration_seconds !== job.episode.duration_seconds
            || currentEpisode.thumbnailUrl !== job.episode.thumbnailUrl
            || currentEpisode.status !== job.episode.status
          );
        });

        if (changedReadyJobs.length > 0) {
          admin.applyPersistedDraft((current) => {
            const nextEpisodes = (current.sermons.audioSermons || []).map((episode) => {
              const matchingJob = changedReadyJobs.find((job) => job.episode?.id === episode.id);

              if (!matchingJob) {
                return episode;
              }

              return {
                ...episode,
                audio_url: matchingJob.episode.audio_url,
                duration_seconds: matchingJob.episode.duration_seconds,
                thumbnailUrl: matchingJob.episode.thumbnailUrl,
                status: matchingJob.episode.status,
                youtube_url: matchingJob.episode.youtube_url,
                start_time: matchingJob.episode.start_time,
                end_time: matchingJob.episode.end_time,
              };
            });

            return {
              ...current,
              sermons: {
                ...current.sermons,
                audioSermons: nextEpisodes,
              },
            };
          });
        }
      } catch {
        // Keep background polling silent so manual editing still works when local Netlify functions are unavailable.
      }
    }

    loadJobs();
    const intervalId = window.setInterval(loadJobs, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeExtractionJobs.length, activeTab, admin, audioEpisodes, episodeIdsKey]);

  function beginCreateEpisode() {
    setCreatingEpisode(true);
    setSelectedEpisodeId('');
    setEpisodeForm(normalizeEpisodeForm({
      speaker: podcast.author || '',
      status: 'draft',
    }));
  }

  function selectEpisode(episode) {
    setCreatingEpisode(false);
    setSelectedEpisodeId(episode.id);
    setEpisodeForm(normalizeEpisodeForm(episode));
  }

  function updateEpisodeField(key, value) {
    setEpisodeForm((current) => ({ ...current, [key]: value }));
  }

  function updatePodcastField(key, value) {
    admin.updateValue(['sermons', 'podcast', key], value);
  }

  async function handleAudioUpload(file) {
    setUploadingAudio(true);

    try {
      const media = await admin.uploadFile(file);
      updateEpisodeField('audio_url', media.url);
      admin.setNotice(`Uploaded ${file.name}. Save the episode to keep it in the draft.`);
    } catch {
      // The admin portal context already sets an error message.
    } finally {
      setUploadingAudio(false);
    }
  }

  async function handleExtractAudio() {
    const nextRecord = buildEpisodePayload(episodeForm, selectedEpisodeId);
    const range = validateTimecodeRange(nextRecord.start_time, nextRecord.end_time);

    if (!nextRecord.title) {
      admin.setError('Episode title is required before extraction.');
      return;
    }

    if (!nextRecord.date) {
      admin.setError('Episode date is required before extraction.');
      return;
    }

    if (!nextRecord.youtube_url) {
      admin.setError('A YouTube URL is required before extraction.');
      return;
    }

    if (!range.valid) {
      admin.setError(range.error);
      return;
    }

    if (nextRecord.episode_number !== null && !Number.isFinite(nextRecord.episode_number)) {
      admin.setError('Episode number must be numeric.');
      return;
    }

    setDispatchingEpisodeId(nextRecord.id);

    try {
      const result = await dispatchSermonExtraction({
        ...nextRecord,
        episode_id: nextRecord.id,
      });

      admin.applyPersistedValue(['sermons', 'audioSermons'], result.audioSermons || []);
      setCreatingEpisode(false);
      setSelectedEpisodeId(result.episode.id);
      setEpisodeForm(normalizeEpisodeForm(result.episode));
      setJobMap((current) => ({
        ...current,
        [result.job.episode_id]: result.job,
      }));
      admin.setNotice('Audio extraction queued. The worker will attach the MP3 automatically when processing finishes.');
    } catch (error) {
      admin.setError(error.message || 'Unable to queue sermon extraction.');
    } finally {
      setDispatchingEpisodeId('');
    }
  }

  function saveEpisode() {
    if (!episodeForm.title.trim()) {
      admin.setError('Episode title is required.');
      return;
    }

    if (!episodeForm.date) {
      admin.setError('Episode date is required.');
      return;
    }

    const nextRecord = buildEpisodePayload(episodeForm, selectedEpisodeId);

    if (nextRecord.episode_number !== null && !Number.isFinite(nextRecord.episode_number)) {
      admin.setError('Episode number must be numeric.');
      return;
    }

    if (nextRecord.duration_seconds !== null && !Number.isFinite(nextRecord.duration_seconds)) {
      admin.setError('Duration must be numeric.');
      return;
    }

    if (!nextRecord.audio_url && nextRecord.status !== 'draft') {
      admin.setError('Episodes without audio should stay in draft until extraction or upload is complete.');
      return;
    }

    const nextEpisodes = selectedEpisodeId
      ? audioEpisodes.map((episode) => (episode.id === selectedEpisodeId ? nextRecord : episode))
      : [nextRecord, ...audioEpisodes];

    admin.updateValue(['sermons', 'audioSermons'], nextEpisodes);
    admin.setNotice(selectedEpisodeId ? 'Episode updated in the draft.' : 'Episode added to the draft.');
    setCreatingEpisode(false);
    setSelectedEpisodeId(nextRecord.id);
    setEpisodeForm(normalizeEpisodeForm(nextRecord));
  }

  function deleteEpisode(episodeId) {
    const targetEpisode = audioEpisodes.find((episode) => episode.id === episodeId);

    if (!targetEpisode) {
      return;
    }

    if (!window.confirm(`Delete "${targetEpisode.title}" from the sermon manager draft?`)) {
      return;
    }

    const remainingEpisodes = audioEpisodes.filter((episode) => episode.id !== episodeId);
    admin.updateValue(['sermons', 'audioSermons'], remainingEpisodes);
    admin.setNotice('Episode removed from the draft.');

    if (selectedEpisodeId === episodeId) {
      setSelectedEpisodeId(remainingEpisodes[0]?.id || '');
      setCreatingEpisode(false);
      setEpisodeForm(normalizeEpisodeForm(remainingEpisodes[0] || {}));
    }
  }

  async function copyFeedUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopiedFeed(true);
      admin.setNotice('Podcast feed URL copied.');
      window.setTimeout(() => setCopiedFeed(false), 2000);
    } catch {
      admin.setError('Unable to copy the feed URL from this browser.');
    }
  }

  const activeEpisodeTitle = creatingEpisode
    ? 'New Episode'
    : (episodeForm.title?.trim() || 'Episode Editor');

  return (
    <div className="max-w-7xl">
      <PageHeader
        title="Sermons"
        subtitle="Standalone podcast and audio-sermon manager. Episodes are stored in the site draft, published through the same workflow as the rest of the website, and no longer depend on Base44."
      >
        <RouterLink to="/sermons" className="inline-flex">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View Public Sermons Page
          </Button>
        </RouterLink>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="admin-chip-set mb-6 flex h-auto flex-wrap gap-2 bg-transparent p-1">
          <TabsTrigger value="overview" className="gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="episodes" className="gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <Headphones className="h-4 w-4" />
            Episodes
          </TabsTrigger>
          <TabsTrigger value="podcast" className="gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <Settings className="h-4 w-4" />
            Podcast Settings
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <Rss className="h-4 w-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-[#4857d6] data-[state=active]:text-white">
            <Youtube className="h-4 w-4" />
            Video Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Audio Episodes" value={audioEpisodes.length} hint="Total items in the draft library" icon={Mic} />
            <StatCard label="Published" value={publishedEpisodes.length} hint="Will be live after site publish" icon={Radio} />
            <StatCard label="Ready" value={readyEpisodes.length} hint="Prepared but not yet in the feed" icon={CheckCircle} />
            <StatCard label="Active Jobs" value={activeExtractionJobs.length} hint="Queued or processing extractions" icon={Headphones} />
          </div>

          <EditorSection
            title="Automatic Extraction Workflow"
            description="Admins can now queue sermon extraction from a YouTube URL, and the background worker trims, converts, uploads, and attaches the audio automatically."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">What happens automatically</p>
                <ul className="mt-3 space-y-2">
                  <li>Queued jobs are pushed to GitHub Actions for `yt-dlp` and `ffmpeg` processing.</li>
                  <li>Live YouTube URLs wait until the archive is available, then resume automatically.</li>
                  <li>The finished MP3 is uploaded to Supabase Storage and the episode is moved to ready.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Still manual when needed</p>
                <ul className="mt-3 space-y-2">
                  <li>You can still upload an MP3 or paste a hosted audio URL yourself.</li>
                  <li>Publishing stays separate: extraction stops at ready for review.</li>
                  <li>The public website and RSS feed only change after the normal site publish flow.</li>
                </ul>
              </div>
            </div>
          </EditorSection>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <EditorSection title="Recent Episodes" description="Latest audio items from the draft library.">
              {audioEpisodes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                  No audio episodes yet. Create the first one from the Episodes tab.
                </div>
              ) : (
                <div className="space-y-3">
                  {audioEpisodes.slice(0, 5).map((episode) => (
                    <button
                      type="button"
                      key={episode.id}
                      onClick={() => {
                        selectEpisode(episode);
                        setActiveTab('episodes');
                      }}
                      className="flex w-full items-start justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/20"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{episode.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {episode.speaker || 'No speaker'} · {formatEpisodeDate(episode.date)}
                        </div>
                        {jobMap[episode.id]?.status ? (
                          <div className="mt-2">
                            <ExtractionJobBadge job={jobMap[episode.id]} />
                          </div>
                        ) : null}
                      </div>
                      <StatusBadge status={episode.status} />
                    </button>
                  ))}
                </div>
              )}
            </EditorSection>

            <EditorSection title="Podcast Feed Readiness" description="These checks are based on the current draft content.">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="text-sm font-medium text-foreground">{podcast.title || 'Podcast title not set yet'}</div>
                <div className="mt-1 text-xs text-muted-foreground">{feedUrl}</div>
              </div>

              {checklist.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  The core feed requirements are in place. Save your draft and publish the site to update the live feed output.
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="font-medium">Still needed before submitting the feed</div>
                  <ul className="mt-3 space-y-2">
                    {checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </EditorSection>
          </div>
        </TabsContent>

        <TabsContent value="episodes" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <EditorSection title="Episode Library" description="Manage audio sermons that will appear on the public sermons page and in the podcast feed.">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, speaker, or series"
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['all', 'draft', 'ready', 'published'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        statusFilter === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {value === 'all' ? 'All statuses' : value.charAt(0).toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>

                <Button onClick={beginCreateEpisode} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Episode
                </Button>
              </div>

              <div className="space-y-3">
                {filteredEpisodes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                    No episodes match the current filters.
                  </div>
                ) : (
                  filteredEpisodes.map((episode) => {
                    const selected = !creatingEpisode && episode.id === selectedEpisodeId;

                    return (
                      <button
                        type="button"
                        key={episode.id}
                        onClick={() => selectEpisode(episode)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/30 hover:bg-muted/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">{episode.title}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {episode.speaker || 'No speaker'} · {formatEpisodeDate(episode.date)}
                            </div>
                            {episode.series ? <div className="mt-1 text-xs text-muted-foreground">{episode.series}</div> : null}
                            {jobMap[episode.id]?.status ? (
                              <div className="mt-2">
                                <ExtractionJobBadge job={jobMap[episode.id]} />
                              </div>
                            ) : null}
                          </div>
                          <StatusBadge status={episode.status} />
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{episode.audio_url ? 'Audio attached' : 'No audio yet'}</span>
                          {episode.duration_seconds ? <span>{formatDuration(episode.duration_seconds)}</span> : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </EditorSection>

            <EditorSection
              title={activeEpisodeTitle}
              description="Edit metadata, queue YouTube extraction, attach audio manually if needed, and choose whether an episode stays in draft, is ready for review, or is included in the published feed."
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={episodeForm.status || 'draft'} />
                <ExtractionJobBadge job={selectedEpisodeJob} />
                {!creatingEpisode && selectedEpisodeId ? (
                  <button
                    type="button"
                    onClick={() => deleteEpisode(selectedEpisodeId)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Episode Title"
                  value={episodeForm.title}
                  onChange={(value) => updateEpisodeField('title', value)}
                  placeholder="Walking by Faith"
                />
                <Field
                  label="Speaker"
                  value={episodeForm.speaker}
                  onChange={(value) => updateEpisodeField('speaker', value)}
                  placeholder="Ps. Steven Holmes"
                />
                <Field
                  label="Episode Date"
                  type="date"
                  value={episodeForm.date}
                  onChange={(value) => updateEpisodeField('date', value)}
                />
                <Field
                  label="Series"
                  value={episodeForm.series}
                  onChange={(value) => updateEpisodeField('series', value)}
                  placeholder="Sunday Service"
                />
                <Field
                  label="Episode Number"
                  type="number"
                  value={episodeForm.episode_number}
                  onChange={(value) => updateEpisodeField('episode_number', value)}
                  placeholder="12"
                />
                <Field
                  label="Duration (seconds)"
                  type="number"
                  value={episodeForm.duration_seconds}
                  onChange={(value) => updateEpisodeField('duration_seconds', value)}
                  placeholder="2400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Short Description</label>
                <Textarea
                  value={episodeForm.description}
                  onChange={(event) => updateEpisodeField('description', event.target.value)}
                  placeholder="Short summary for the public sermons page."
                  rows={3}
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">Audio File</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Upload the finished MP3, paste a hosted audio URL, or use the automatic YouTube extraction workflow below.
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary">
                    <Upload className="h-4 w-4" />
                    {uploadingAudio ? 'Uploading…' : 'Upload Audio'}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      disabled={uploadingAudio}
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          handleAudioUpload(file);
                        }

                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">Audio URL</label>
                  <Input
                    value={episodeForm.audio_url}
                    onChange={(event) => updateEpisodeField('audio_url', event.target.value)}
                    placeholder="https://..."
                  />
                </div>

                {episodeForm.audio_url ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-4">
                    <audio controls src={episodeForm.audio_url} className="w-full" />
                    <a
                      href={episodeForm.audio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      Open audio file <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}

                {selectedEpisodeJob?.error_message ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {selectedEpisodeJob.error_message}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="YouTube Source URL"
                  value={episodeForm.youtube_url}
                  onChange={(value) => updateEpisodeField('youtube_url', value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <Field
                  label="Scripture Reference"
                  value={episodeForm.scripture_reference}
                  onChange={(value) => updateEpisodeField('scripture_reference', value)}
                  placeholder="John 3:16"
                />
                <Field
                  label="Sermon Start Time"
                  value={episodeForm.start_time}
                  onChange={(value) => updateEpisodeField('start_time', value)}
                  placeholder="00:32:15"
                />
                <Field
                  label="Sermon End Time"
                  value={episodeForm.end_time}
                  onChange={(value) => updateEpisodeField('end_time', value)}
                  placeholder="01:15:00"
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">Automatic Extraction</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Queue the YouTube worker with the URL and sermon time range above. If you paste a live service URL, the job will wait until YouTube finishes the archive before trimming and uploading the MP3.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedEpisodeJob?.status === 'failed' || selectedEpisodeJob?.status === 'waiting_for_archive') ? (
                      <Button
                        variant="outline"
                        onClick={handleExtractAudio}
                        disabled={dispatchingSelectedEpisode}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    ) : null}
                    <Button
                      onClick={handleExtractAudio}
                      disabled={dispatchingSelectedEpisode || isExtractionActiveStatus(selectedEpisodeJob?.status)}
                      className="gap-2"
                    >
                      {dispatchingSelectedEpisode || isExtractionActiveStatus(selectedEpisodeJob?.status) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Youtube className="h-4 w-4" />
                      )}
                      {selectedEpisodeJob?.status === 'waiting_for_archive'
                        ? 'Re-check Archive'
                        : (dispatchingSelectedEpisode ? 'Queueing…' : 'Extract Audio')}
                    </Button>
                  </div>
                </div>

                {selectedEpisodeJob ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-background p-4 text-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Worker state</div>
                      <div className="mt-2">
                        <ExtractionJobBadge job={selectedEpisodeJob} />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest update</div>
                      <div className="mt-2 text-foreground">
                        {selectedEpisodeJob.updated_at ? new Date(selectedEpisodeJob.updated_at).toLocaleString('en-GB') : 'Waiting for worker update'}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Show Notes</label>
                  <Textarea
                    value={episodeForm.show_notes}
                    onChange={(event) => updateEpisodeField('show_notes', event.target.value)}
                    placeholder="Podcast show notes, summary, or key takeaways."
                    rows={8}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Transcript / Notes</label>
                  <Textarea
                    value={episodeForm.transcript}
                    onChange={(event) => updateEpisodeField('transcript', event.target.value)}
                    placeholder="Optional transcript, timestamps, or internal notes."
                    rows={8}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-sm font-medium text-foreground">Release State</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Draft stays internal. Ready means the episode is complete but not in the public feed yet. Published includes it in the public page and RSS feed after you publish the whole site.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { value: 'draft', label: 'Draft' },
                    { value: 'ready', label: 'Ready' },
                    { value: 'published', label: 'Published' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateEpisodeField('status', item.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        episodeForm.status === item.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={beginCreateEpisode} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start Another
                </Button>
                <Button onClick={saveEpisode} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Save Episode
                </Button>
              </div>
            </EditorSection>
          </div>
        </TabsContent>

        <TabsContent value="podcast" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <EditorSection title="Podcast Identity" description="These fields power the generated RSS feed and podcast directory listings.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Podcast Title"
                  value={podcast.title}
                  onChange={(value) => updatePodcastField('title', value)}
                  placeholder="Dundee Elim Sermons"
                />
                <Field
                  label="Church Name"
                  value={podcast.churchName}
                  onChange={(value) => updatePodcastField('churchName', value)}
                  placeholder="Dundee Elim Church"
                />
                <Field
                  label="Author / Primary Speaker"
                  value={podcast.author}
                  onChange={(value) => updatePodcastField('author', value)}
                  placeholder="Ps. Steven Holmes"
                />
                <Field
                  label="Contact Email"
                  value={podcast.email}
                  onChange={(value) => updatePodcastField('email', value)}
                  type="email"
                  placeholder="media@dundee-elim.org.uk"
                />
                <Field
                  label="Website URL"
                  value={podcast.website}
                  onChange={(value) => updatePodcastField('website', value)}
                  placeholder="https://www.dundee-elim.org.uk"
                />
                <Field
                  label="Category"
                  value={podcast.category}
                  onChange={(value) => updatePodcastField('category', value)}
                  placeholder="Religion & Spirituality"
                />
                <Field
                  label="Language"
                  value={podcast.language}
                  onChange={(value) => updatePodcastField('language', value)}
                  placeholder="en-gb"
                />
                <Field
                  label="Copyright"
                  value={podcast.copyright}
                  onChange={(value) => updatePodcastField('copyright', value)}
                  placeholder="Dundee Elim Church"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Podcast Description</label>
                <Textarea
                  value={podcast.description || ''}
                  onChange={(event) => updatePodcastField('description', event.target.value)}
                  placeholder="Weekly sermons and Bible teaching from Dundee Elim Church."
                  rows={5}
                />
              </div>
            </EditorSection>

            <EditorSection title="Cover Art" description="This image is used for podcast directories and the generated feed.">
              <ImageUpload
                label="Podcast Cover Art"
                value={podcast.coverArt}
                busy={admin.uploadingPath === 'sermons.podcast.coverArt'}
                onUpload={(file) => admin.replaceMediaAtPath(['sermons', 'podcast', 'coverArt'], file)}
                onChange={(nextValue) => admin.updateValue(['sermons', 'podcast', 'coverArt'], nextValue)}
              />

              <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                Apple Podcasts typically expects square artwork between 1400x1400 and 3000x3000 pixels. If you do not upload cover art, the feed will still generate but directory approval is likely to fail.
              </div>
            </EditorSection>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <EditorSection title="RSS Feed" description="The feed reads the live published site content. Save your draft and publish the site whenever you want directory updates to go live.">
            <div className="flex flex-col gap-3 lg:flex-row">
              <Input value={feedUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" onClick={copyFeedUrl} className="gap-2">
                {copiedFeed ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copiedFeed ? 'Copied' : 'Copy Feed URL'}
              </Button>
              <a href={feedUrl} target="_blank" rel="noreferrer" className="inline-flex">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Feed
                </Button>
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Published episodes</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{publishedEpisodes.length}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ready episodes</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{readyEpisodes.length}</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Checklist items left</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{checklist.length}</div>
              </div>
            </div>
          </EditorSection>

          <EditorSection title="Directory Submission" description="Submit the same RSS feed URL to each directory once. New published episodes should flow through automatically afterwards.">
            <div className="grid gap-4 lg:grid-cols-2">
              {DISTRIBUTION_PLATFORMS.map((platform) => (
                <div key={platform.name} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-foreground">{platform.name}</div>
                    <a href={platform.url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </a>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {platform.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </EditorSection>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <EditorSection title="Video Source" description="Video sermons still come from YouTube automatically. This screen remains here so audio and video management stay in one admin area.">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">Automatic YouTube feed</p>
                <p className="mt-1">Change the channel source from the Website settings. The public sermons page will fall back to the stored snapshot if the live feed is unavailable.</p>
                <RouterLink to="/admin/website/global" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-800 underline underline-offset-4">
                  Open Website settings
                </RouterLink>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current channel</div>
                <div className="mt-2 break-all text-sm font-medium text-foreground">
                  {admin.draftContent.settings.links.youtubeChannelId || 'Not set'}
                </div>
                {admin.draftContent.settings.links.youtubeUrl ? (
                  <a
                    href={admin.draftContent.settings.links.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    Open YouTube channel <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </EditorSection>

          {youtubeFeed.loading ? <div className="py-8 text-sm text-muted-foreground">Loading latest YouTube videos…</div> : null}
          {!youtubeFeed.loading && youtubeFeed.error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              The live YouTube feed is unavailable right now. Showing the stored video list as a fallback.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="aspect-video bg-black/40">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Youtube className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="text-base font-semibold text-foreground">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {video.publishedAt ? formatEpisodeDate(video.publishedAt) : 'No date available'}
                  </p>
                  {video.watchUrl ? (
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      Watch on YouTube <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}

            {!youtubeFeed.loading && videos.length === 0 ? (
              <div className="col-span-full rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
                No video sermons found yet.
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
