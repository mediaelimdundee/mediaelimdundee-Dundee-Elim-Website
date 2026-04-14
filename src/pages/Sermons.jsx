import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, Download, Filter, Music, Play, Radio, Search, X, Youtube } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { filterPublishedItems, resolveMediaSrc } from '@/lib/siteContentUtils';
import { fadeUp } from '@/lib/motion';
import { normalizeSnapshotVideoSermons, useYoutubeSermons } from '@/lib/youtubeSermons';

const inputClass = 'glass-input-field';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

function sortByDateDesc(left, right) {
  return String(right.date || '').localeCompare(String(left.date || ''));
}

export default function Sermons() {
  const { content } = useSiteContent();
  const [activeTab, setActiveTab] = useState('youtube');
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSeries, setFilterSeries] = useState('');
  const [filterSpeaker, setFilterSpeaker] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [isLive, setIsLive] = useState(false);

  const youtubeFeed = useYoutubeSermons(content.settings.links.youtubeChannelId);

  useEffect(() => {
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${content.settings.links.youtubeChannelId}/live&format=json`)
      .then((response) => {
        setIsLive(response.ok);
      })
      .catch(() => setIsLive(false));
  }, [content.settings.links.youtubeChannelId]);

  const fallbackVideos = useMemo(
    () => normalizeSnapshotVideoSermons(content.sermons.videoSermons),
    [content.sermons.videoSermons],
  );
  const sermonVideos = youtubeFeed.videos.length > 0 ? youtubeFeed.videos : fallbackVideos;
  const audioSermons = useMemo(
    () => filterPublishedItems(content.sermons.audioSermons).sort(sortByDateDesc),
    [content.sermons.audioSermons],
  );
  const allSeries = [...new Set(audioSermons.map((sermon) => sermon.series).filter(Boolean))];
  const allSpeakers = [...new Set(audioSermons.map((sermon) => sermon.speaker).filter(Boolean))];
  const hasActiveAudioFilters = filterSeries || filterSpeaker || filterDateFrom || filterDateTo;

  const filteredVideos = sermonVideos.filter((video) => (
    !search || video.title.toLowerCase().includes(search.toLowerCase())
  ));
  const filteredAudio = audioSermons.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.speaker?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterSeries && item.series !== filterSeries) {
      return false;
    }
    if (filterSpeaker && item.speaker !== filterSpeaker) {
      return false;
    }
    if (filterDateFrom && item.date && item.date < filterDateFrom) {
      return false;
    }
    if (filterDateTo && item.date && item.date > filterDateTo) {
      return false;
    }

    return true;
  });

  const tabs = [
    { key: 'live', label: content.sermons.tabs.live, Icon: Radio },
    { key: 'youtube', label: content.sermons.tabs.video, Icon: Youtube },
    { key: 'audio', label: content.sermons.tabs.audio, Icon: Music },
  ];

  return (
    <div className="pb-20">
      <SEOHead title={content.sermons.seo.title} description={content.sermons.seo.description} path="/sermons" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.sermons.header.image)} alt={content.sermons.header.image.alt || 'Sermons'} className="h-full w-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.sermons.header.eyebrow}</span>
          <h1 className="page-title">
            {content.sermons.header.titleLead} <span className="text-gradient">{content.sermons.header.titleHighlight}</span>
          </h1>
          <p className="page-description">{content.sermons.header.description}</p>
        </div>
      </div>

      <div className="mb-6 px-4">
        <div className="mx-auto max-w-7xl">
          <a href={content.settings.links.youtubeUrl} target="_blank" rel="noreferrer" className="group glass-panel block p-4 transition-colors hover:border-red-500/30">
            {specularLine}
            <div className="flex items-center gap-4">
              <div className="glass-icon-badge" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <Youtube className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{content.sermons.subscribeCard.title}</div>
                <div className="text-xs text-white/45">{content.sermons.subscribeCard.description}</div>
              </div>
              <div className="hidden text-sm text-white/30 sm:block">{content.sermons.subscribeCard.linkLabel} →</div>
            </div>
          </a>
        </div>
      </div>

      <div className="mb-6 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="glass-chip-set">
              {tabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setSelectedVideo(null);
                  }}
                  className={`glass-chip flex items-center gap-2 ${activeTab === key ? 'glass-chip-active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {key === 'live' && isLive ? <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> : null}
                </button>
              ))}
            </div>

            {activeTab === 'youtube' ? (
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            ) : null}

            {activeTab === 'audio' ? (
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                  type="text"
                  placeholder="Search audio..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <button
                onClick={() => setShowFilters((value) => !value)}
                className={`glass-chip flex items-center gap-2 ${showFilters || hasActiveAudioFilters ? 'glass-chip-active text-white' : ''}`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                  {hasActiveAudioFilters ? <span className="h-2 w-2 rounded-full bg-blue-400" /> : null}
                </button>
              </div>
            ) : null}
          </div>

          <AnimatePresence>
            {showFilters && activeTab === 'audio' ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-panel relative mx-auto mt-3 p-5">
                {specularLine}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Filter audio sermons</h3>
                  {hasActiveAudioFilters ? (
                    <button onClick={() => { setFilterSeries(''); setFilterSpeaker(''); setFilterDateFrom(''); setFilterDateTo(''); }} className="flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-red-400">
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <select value={filterSeries} onChange={(event) => setFilterSeries(event.target.value)} className={`${inputClass} appearance-none pr-8`}>
                      <option value="" className="bg-slate-900">All Series</option>
                      {allSeries.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
                  </div>
                  <div className="relative">
                    <select value={filterSpeaker} onChange={(event) => setFilterSpeaker(event.target.value)} className={`${inputClass} appearance-none pr-8`}>
                      <option value="" className="bg-slate-900">All Speakers</option>
                      {allSpeakers.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
                  </div>
                  <input type="date" value={filterDateFrom} onChange={(event) => setFilterDateFrom(event.target.value)} className={`${inputClass} [color-scheme:dark]`} />
                  <input type="date" value={filterDateTo} onChange={(event) => setFilterDateTo(event.target.value)} className={`${inputClass} [color-scheme:dark]`} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-4">
        <div className="mx-auto max-w-7xl">
          {activeTab === 'live' ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {isLive ? (
                <div className="glass-panel mb-6 overflow-hidden p-1 glow-blue">
                  <div className="aspect-video w-full overflow-hidden rounded-[1.4rem]">
                    <iframe className="h-full w-full" src={`https://www.youtube.com/embed/live_stream?channel=${content.settings.links.youtubeChannelId}&autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Dundee Elim Live" />
                  </div>
                </div>
              ) : null}
              <div className="glass-panel relative p-6 text-center">
                {specularLine}
                <div className="mb-2 flex items-center justify-center gap-2">
                  {isLive ? (
                    <>
                      <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-semibold uppercase tracking-wider text-red-400">{content.sermons.live.liveTitle}</span>
                    </>
                  ) : (
                    <>
                      <span className="h-3 w-3 rounded-full bg-white/15" />
                      <span className="text-sm font-semibold uppercase tracking-wider text-white/40">{content.sermons.live.offlineTitle}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-white/50">{isLive ? content.sermons.live.liveDescription : content.sermons.live.offlineDescription}</p>
                <a href={content.settings.links.youtubeUrl} target="_blank" rel="noreferrer" className="glass-action-soft mt-4 inline-flex px-5 text-sm font-medium text-red-300 hover:text-white" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Youtube className="h-4 w-4" />
                  {content.sermons.live.buttonLabel}
                </a>
              </div>
            </motion.div>
          ) : null}

          {activeTab === 'youtube' ? (
            <>
              {youtubeFeed.error ? (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  The live YouTube feed is unavailable right now. Showing the stored video list instead.
                </div>
              ) : null}

              {selectedVideo ? (
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }} className="glass-panel mb-8 overflow-hidden p-1">
                  <div className="aspect-video overflow-hidden rounded-[1.4rem]">
                    <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Sermon" />
                  </div>
                  <div className="flex justify-end p-4">
                    <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-1.5 text-sm text-white/30 transition-colors hover:text-white">
                      <X className="h-4 w-4" />
                      Close player
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {!selectedVideo && filteredVideos.length > 0 ? (
                <div className="glass-panel mb-8 overflow-hidden p-1">
                  <div className="aspect-video overflow-hidden rounded-[1.4rem]">
                    <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${filteredVideos[0].id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={content.sermons.videoSection.title} />
                  </div>
                </div>
              ) : null}

              {youtubeFeed.loading ? <p className="py-10 text-center text-white/30">Loading latest videos…</p> : null}
              {!youtubeFeed.loading && filteredVideos.length === 0 ? (
                <p className="py-10 text-center text-white/30">No videos match your search.</p>
              ) : null}
              {!youtubeFeed.loading && filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={`${video.id}-${index}`}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: index * 0.03 }}
                      onClick={() => setSelectedVideo(video.id)}
                      className="glass-panel group relative cursor-pointer overflow-hidden transition-transform hover:-translate-y-1"
                    >
                      {specularLine}
                      <div className="relative aspect-video bg-black/40">
                        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-100" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full p-3 transition-all" style={{ background: 'rgba(239,68,68,0.8)' }}>
                            <Play className="h-5 w-5 fill-white text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white">{video.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Calendar className="h-3 w-3" />
                          {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : 'No date'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {activeTab === 'audio' ? (
            <div>
              {filteredAudio.length === 0 ? (
                <div className="glass-panel relative p-16 text-center">
                  {specularLine}
                  <Music className="mx-auto mb-4 h-12 w-12 text-white/20" />
                  <p className="text-lg text-white/40">{audioSermons.length === 0 ? 'No audio sermons yet.' : 'No audio sermons match your filters.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAudio.map((sermon, index) => (
                    <motion.div key={sermon.id || `${sermon.title}-${index}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: index * 0.04 }} className="glass-panel relative flex flex-col gap-4 p-6">
                      {specularLine}
                      <div className="flex items-start gap-3">
                        <div className="glass-icon-badge shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                          <Music className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white leading-snug">{sermon.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/40">
                            <span>{sermon.speaker}</span>
                            {sermon.date ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {sermon.date}
                              </span>
                            ) : null}
                          </div>
                          {sermon.series ? <span className="mt-1 block text-xs text-blue-400/60">{sermon.series}</span> : null}
                        </div>
                      </div>
                      {sermon.description ? <p className="line-clamp-3 text-xs leading-relaxed text-white/35">{sermon.description}</p> : null}
                      {sermon.audio_url ? (
                        <div className="mt-auto flex flex-col gap-2">
                          <audio controls className="h-9 w-full" style={{ filter: 'invert(0.8) hue-rotate(180deg)' }}>
                            <source src={sermon.audio_url} />
                          </audio>
                          <a href={sermon.audio_url} download className="glass-action-soft flex items-center justify-center px-4 text-xs font-medium text-blue-300 hover:text-white" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', minHeight: '2.5rem' }}>
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
