import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Download, Filter, Music, Play, Radio, Search, User, X, Youtube, ChevronDown } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

const inputClass = 'w-full rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 bg-transparent transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' };

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

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

  useEffect(() => {
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${content.settings.links.youtubeChannelId}/live&format=json`)
      .then((response) => {
        setIsLive(response.ok);
      })
      .catch(() => setIsLive(false));
  }, [content.settings.links.youtubeChannelId]);

  const sermonVideos = content.sermons.videoSermons;
  const audioSermons = content.sermons.audioSermons;
  const allSeries = [...new Set([...sermonVideos.map((video) => video.series), ...audioSermons.map((sermon) => sermon.series)].filter(Boolean))];
  const allSpeakers = [...new Set([...sermonVideos.map((video) => video.speaker), ...audioSermons.map((sermon) => sermon.speaker)].filter(Boolean))];
  const hasActiveFilters = filterSeries || filterSpeaker || filterDateFrom || filterDateTo;

  function applyFilters(items) {
    return items.filter((item) => {
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
  }

  const filteredYoutube = applyFilters(sermonVideos);
  const filteredAudio = applyFilters(audioSermons).sort((left, right) => (right.date || '').localeCompare(left.date || ''));
  const tabs = [
    { key: 'live', label: content.sermons.tabs.live, Icon: Radio },
    { key: 'youtube', label: content.sermons.tabs.video, Icon: Youtube },
    { key: 'audio', label: content.sermons.tabs.audio, Icon: Music },
  ];

  return (
    <div className="pb-20">
      <SEOHead title={content.sermons.seo.title} description={content.sermons.seo.description} path="/sermons" />

      <div className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={resolveMediaSrc(content.sermons.header.image)} alt={content.sermons.header.image.alt || 'Sermons'} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>
        <div className="orb w-96 h-96 bg-violet-700 top-0 left-1/4" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.sermons.header.eyebrow}</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 mb-4">
            {content.sermons.header.titleLead} <span className="text-gradient">{content.sermons.header.titleHighlight}</span>
          </h1>
          <p className="text-white/55 max-w-2xl mx-auto">{content.sermons.header.description}</p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <a href={content.settings.links.youtubeUrl} target="_blank" rel="noreferrer" className="lg-surface rounded-2xl p-4 flex items-center gap-4 hover:border-red-500/30 transition-colors group relative overflow-hidden block">
            {specularLine}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Youtube className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{content.sermons.subscribeCard.title}</div>
              <div className="text-white/45 text-xs">{content.sermons.subscribeCard.description}</div>
            </div>
            <div className="text-white/30 text-sm hidden sm:block">{content.sermons.subscribeCard.linkLabel} →</div>
          </a>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSelectedVideo(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === key ? (key === 'live' ? 'text-red-300' : 'text-white') : 'text-white/50 hover:text-white'
                }`}
                style={activeTab === key ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
                {key === 'live' && isLive && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
              </button>
            ))}
          </div>

          {activeTab !== 'live' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" placeholder="Search sermons..." value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} pl-10`} style={inputStyle} />
              </div>
              <button
                onClick={() => setShowFilters((value) => !value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters || hasActiveFilters ? 'text-blue-300' : 'text-white/50 hover:text-white'}`}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-400" />}
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showFilters && activeTab !== 'live' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="max-w-7xl mx-auto mt-3 lg-surface rounded-2xl p-5 overflow-hidden relative">
              {specularLine}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium text-sm">Filter Sermons</h3>
                {hasActiveFilters && (
                  <button onClick={() => { setFilterSeries(''); setFilterSpeaker(''); setFilterDateFrom(''); setFilterDateTo(''); }} className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <select value={filterSeries} onChange={(event) => setFilterSeries(event.target.value)} className={`${inputClass} appearance-none pr-8`} style={inputStyle}>
                    <option value="" className="bg-slate-900">All Series</option>
                    {allSeries.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={filterSpeaker} onChange={(event) => setFilterSpeaker(event.target.value)} className={`${inputClass} appearance-none pr-8`} style={inputStyle}>
                    <option value="" className="bg-slate-900">All Speakers</option>
                    {allSpeakers.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                </div>
                <input type="date" value={filterDateFrom} onChange={(event) => setFilterDateFrom(event.target.value)} className={`${inputClass} [color-scheme:dark]`} style={inputStyle} />
                <input type="date" value={filterDateTo} onChange={(event) => setFilterDateTo(event.target.value)} className={`${inputClass} [color-scheme:dark]`} style={inputStyle} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'live' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {isLive && (
                <div className="lg-surface rounded-3xl overflow-hidden mb-6 glow-blue p-1">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/live_stream?channel=${content.settings.links.youtubeChannelId}&autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Dundee Elim Live" />
                  </div>
                </div>
              )}
              <div className="lg-surface rounded-2xl p-6 text-center relative overflow-hidden">
                {specularLine}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isLive
                    ? <><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-red-400 font-semibold text-sm uppercase tracking-wider">{content.sermons.live.liveTitle}</span></>
                    : <><span className="w-3 h-3 rounded-full bg-white/15" /><span className="text-white/40 font-semibold text-sm uppercase tracking-wider">{content.sermons.live.offlineTitle}</span></>
                  }
                </div>
                <p className="text-white/50 text-sm">{isLive ? content.sermons.live.liveDescription : content.sermons.live.offlineDescription}</p>
                <a href={content.settings.links.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-red-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Youtube className="w-4 h-4" />
                  {content.sermons.live.buttonLabel}
                </a>
              </div>
            </motion.div>
          )}

          {activeTab === 'youtube' && (
            <>
              {selectedVideo && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="lg-surface rounded-3xl overflow-hidden mb-8 p-1">
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Sermon" />
                  </div>
                  <div className="p-4 flex justify-end">
                    <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-1.5 text-white/30 hover:text-white text-sm transition-colors">
                      <X className="w-4 h-4" />
                      Close player
                    </button>
                  </div>
                </motion.div>
              )}
              {!selectedVideo && sermonVideos.length > 0 && (
                <div className="lg-surface rounded-3xl overflow-hidden mb-8 p-1">
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${sermonVideos[0].id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={content.sermons.videoSection.title} />
                  </div>
                </div>
              )}
              {filteredYoutube.length === 0 ? (
                <p className="text-center text-white/30 py-10">No sermons match your filters.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredYoutube.map((video, index) => (
                    <motion.div
                      key={`${video.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      viewport={{ once: true }}
                      onClick={() => setSelectedVideo(video.id)}
                      className="lg-surface rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group relative"
                    >
                      {specularLine}
                      <div className="relative aspect-video bg-black/40">
                        <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-3 rounded-full transition-all" style={{ background: 'rgba(239,68,68,0.8)' }}>
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
                        <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                          <User className="w-3 h-3" />
                          {video.speaker}
                        </div>
                        {video.series && <p className="text-blue-400/60 text-xs">{video.series}</p>}
                        {video.date && <p className="text-white/25 text-xs mt-1">{video.date}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'audio' && (
            <div>
              {filteredAudio.length === 0 ? (
                <div className="lg-surface rounded-2xl p-16 text-center relative overflow-hidden">
                  {specularLine}
                  <Music className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-lg">{audioSermons.length === 0 ? 'No audio sermons yet.' : 'No sermons match your filters.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAudio.map((sermon, index) => (
                    <motion.div key={sermon.id || `${sermon.title}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="lg-surface rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                      {specularLine}
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                          <Music className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium leading-snug">{sermon.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/40">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{sermon.speaker}</span>
                            {sermon.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{sermon.date}</span>}
                          </div>
                          {sermon.series && <span className="text-blue-400/60 text-xs mt-1 block">{sermon.series}</span>}
                        </div>
                      </div>
                      {sermon.description && <p className="text-white/35 text-xs leading-relaxed line-clamp-3">{sermon.description}</p>}
                      {sermon.audio_url && (
                        <div className="flex flex-col gap-2 mt-auto">
                          <audio controls className="w-full h-9" style={{ filter: 'invert(0.8) hue-rotate(180deg)' }}>
                            <source src={sermon.audio_url} />
                          </audio>
                          <a href={sermon.audio_url} download className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-blue-300 hover:text-white text-xs font-medium transition-colors" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
