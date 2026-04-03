import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Mail, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ministryIconMap, ministryTagStyles, ministryThemeMap } from '@/lib/sitePresentation';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Ministries() {
  const { content } = useSiteContent();
  const [selected, setSelected] = useState(null);
  const [activeTag, setActiveTag] = useState('All');

  const tags = ['All', ...Object.keys(ministryTagStyles)];
  const visible = activeTag === 'All' ? content.ministries.items : content.ministries.items.filter((item) => item.tag === activeTag);

  return (
    <div className="pb-20">
      <SEOHead title={content.ministries.seo.title} description={content.ministries.seo.description} path="/ministries" />

      <div className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={resolveMediaSrc(content.ministries.header.image)} alt={content.ministries.header.image.alt || 'Ministries at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>
        <div className="orb w-96 h-96 bg-indigo-800 top-0 right-1/4" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.ministries.header.eyebrow}</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 mb-4">
            {content.ministries.header.titleLead} <span className="text-gradient">{content.ministries.header.titleHighlight}</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">{content.ministries.header.description}</p>
        </div>
      </div>

      <div className="px-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTag === tag ? 'text-white' : 'text-white/50 hover:text-white'}`}
              style={activeTag === tag
                ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <section className="px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((item, index) => {
            const iconStyle = ministryThemeMap[item.theme] || ministryThemeMap.blue;
            const tagStyle = ministryTagStyles[item.tag] || ministryTagStyles.Discover;
            const Icon = ministryIconMap[item.iconKey] || ministryIconMap.users;

            return (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="lg-surface rounded-2xl p-7 flex flex-col cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden"
                onClick={() => setSelected(item)}
              >
                {specularLine}
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 rounded-xl" style={{ background: iconStyle.bg }}>
                    <Icon className={`w-6 h-6 ${iconStyle.color}`} />
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagStyle.text}`} style={{ background: tagStyle.bg, border: `1px solid ${tagStyle.border}` }}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed flex-1">{item.summary}</p>
                <ul className="mt-4 space-y-1.5">
                  {item.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-white/35 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${iconStyle.color.replace('text-', 'bg-')}`} />
                      {detail}
                    </li>
                  ))}
                </ul>
                <button className={`mt-5 text-xs font-medium ${iconStyle.color} hover:opacity-80 transition-opacity text-left`}>
                  Read more →
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="lg-surface rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative">
                {specularLine}
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl" style={{ background: (ministryThemeMap[selected.theme] || ministryThemeMap.blue).bg }}>
                    {(() => {
                      const Icon = ministryIconMap[selected.iconKey] || ministryIconMap.users;
                      const iconStyle = ministryThemeMap[selected.theme] || ministryThemeMap.blue;
                      return <Icon className={`w-7 h-7 ${iconStyle.color}`} />;
                    })()}
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${(ministryTagStyles[selected.tag] || ministryTagStyles.Discover).text}`} style={{ background: (ministryTagStyles[selected.tag] || ministryTagStyles.Discover).bg }}>
                      {selected.tag}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-white mt-1">{selected.title}</h2>
                  </div>
                </div>
                <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line mb-6">{selected.body}</div>
                <div className="flex flex-wrap gap-3">
                  {selected.linkLabel && selected.linkUrl && (
                    <a href={selected.linkUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl lg-btn-primary text-sm font-medium transition-all">
                      {selected.linkLabel}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {selected.contactEmail && (
                    <a href={`mailto:${selected.contactEmail}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Mail className="w-3.5 h-3.5" />
                      {selected.contactEmail}
                    </a>
                  )}
                  {selected.contactPhone && (
                    <a href={`tel:${selected.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Phone className="w-3.5 h-3.5" />
                      {selected.contactPhone}
                    </a>
                  )}
                  <Link to="/contact" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/50 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Get in touch
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
          {content.ministries.photoStrip.map((asset, index) => (
            <div key={`${asset.url}-${index}`} className="overflow-hidden rounded-2xl aspect-square lg-surface p-0.5">
              <img src={resolveMediaSrc(asset)} alt={asset.alt || 'Community'} className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-500 opacity-80 hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
