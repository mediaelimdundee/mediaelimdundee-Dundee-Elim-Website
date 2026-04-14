import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Mail, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ministryIconMap, ministryTagStyles, ministryThemeMap } from '@/lib/sitePresentation';
import { cardHover, fadeUp } from '@/lib/motion';
import { filterPublishedItems, resolveMediaSrc } from '@/lib/siteContentUtils';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Ministries() {
  const { content } = useSiteContent();
  const [selected, setSelected] = useState(null);
  const [activeTag, setActiveTag] = useState('All');

  const tags = ['All', ...Object.keys(ministryTagStyles)];
  const publishedMinistries = filterPublishedItems(content.ministries.items);
  const visible = activeTag === 'All' ? publishedMinistries : publishedMinistries.filter((item) => item.tag === activeTag);

  return (
    <div className="pb-20">
      <SEOHead title={content.ministries.seo.title} description={content.ministries.seo.description} path="/ministries" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.ministries.header.image)} alt={content.ministries.header.image.alt || 'Ministries at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.ministries.header.eyebrow}</span>
          <h1 className="page-title">
            {content.ministries.header.titleLead} <span className="text-gradient">{content.ministries.header.titleHighlight}</span>
          </h1>
          <p className="page-description">{content.ministries.header.description}</p>
        </div>
      </div>

      <div className="px-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`glass-chip ${activeTag === tag ? 'glass-chip-active' : ''}`}
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
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.04 }}
                {...cardHover}
                className="glass-panel flex cursor-pointer flex-col p-7"
                onClick={() => setSelected(item)}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="glass-icon-badge" style={{ background: iconStyle.bg }}>
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
              <div className="glass-panel-strong relative max-h-[85vh] w-full max-w-2xl overflow-y-auto p-8">
                <button onClick={() => setSelected(null)} className="glass-light absolute right-4 top-4 p-2 text-white/40 transition-colors hover:text-white">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="glass-icon-badge" style={{ background: (ministryThemeMap[selected.theme] || ministryThemeMap.blue).bg }}>
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
                    <a href={selected.linkUrl} target="_blank" rel="noreferrer" className="glass-action-primary px-4 text-sm font-medium">
                      {selected.linkLabel}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {selected.contactEmail && (
                    <a href={`mailto:${selected.contactEmail}`} className="glass-action-soft px-4 text-sm font-medium text-blue-300 hover:text-white">
                      <Mail className="w-3.5 h-3.5" />
                      {selected.contactEmail}
                    </a>
                  )}
                  {selected.contactPhone && (
                    <a href={`tel:${selected.contactPhone.replace(/\s/g, '')}`} className="glass-action-soft px-4 text-sm font-medium text-blue-300 hover:text-white">
                      <Phone className="w-3.5 h-3.5" />
                      {selected.contactPhone}
                    </a>
                  )}
                  <Link to="/contact" className="glass-action-secondary px-4 text-sm font-medium text-white/70 hover:text-white">
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
            <div key={`${asset.url}-${index}`} className="glass-panel overflow-hidden aspect-square p-0.5">
              <img src={resolveMediaSrc(asset)} alt={asset.alt || 'Community'} className="h-full w-full rounded-[1.35rem] object-cover opacity-80 transition-transform duration-500 hover:scale-[1.04] hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
