import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { fadeRight, fadeUp, subtleTap } from '@/lib/motion';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { aboutTravelConfig } from '@/lib/sitePresentation';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
);

export default function About() {
  const { content } = useSiteContent();

  return (
    <div className="pb-20">
      <SEOHead title={content.about.seo.title} description={content.about.seo.description} path="/about" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.about.header.image)} alt={content.about.header.image.alt || 'About Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.about.header.eyebrow}</span>
          <h1 className="page-title">
            {content.about.header.titleLead} <span className="text-gradient">{content.about.header.titleHighlight}</span>
          </h1>
          <p className="page-description">{content.about.header.description}</p>
        </div>
      </div>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-4 rounded-3xl" style={{ background: 'radial-gradient(circle, rgba(80,130,255,0.12) 0%, transparent 70%)' }} />
            <div className="glass-panel-strong p-1.5">
              <img src={resolveMediaSrc(content.about.pastors.image)} alt={content.about.pastors.image.alt || 'Pastors'} className="w-full rounded-[1.45rem] object-cover shadow-2xl" />
            </div>
          </motion.div>
          <motion.div {...fadeRight}>
            <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.about.pastors.eyebrow}</span>
            <h2 className="font-display text-4xl font-bold text-white mt-3 mb-6">
              {content.about.pastors.titleLead}
              <br />
              {content.about.pastors.titleHighlight}
            </h2>
            {content.about.pastors.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-white/60 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white">{content.about.sundayExpectations.title}</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto text-sm">{content.about.sundayExpectations.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.about.sundayExpectations.items.map((item) => (
              <motion.div key={item.number} {...fadeUp} className="glass-panel p-6">
                {specularLine}
                <div className="text-4xl font-display font-bold mb-3" style={{ color: 'rgba(96,165,250,0.2)' }}>{item.number}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="glass-panel mt-5 p-6">
            {specularLine}
            <p className="text-white/55 text-sm leading-relaxed text-center whitespace-pre-line">
              <span className="text-blue-300 font-medium">Note:</span> {content.about.sundayExpectations.note}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white">{content.about.gettingHere.title}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {content.about.gettingHere.cards.map((card) => {
              const style = aboutTravelConfig[card.kind] || aboutTravelConfig.address;
              const Icon = style.Icon;

              return (
                <motion.div key={card.title} {...fadeUp} className="glass-panel p-8">
                  {specularLine}
                  <div className="glass-icon-badge mb-4" style={{ background: style.bg }}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{card.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{card.description}</p>
                  {card.linkLabel && card.linkUrl && (
                    <motion.a {...subtleTap} href={card.linkUrl} target="_blank" rel="noreferrer" className="glass-action-soft mt-4 inline-flex px-5 text-sm text-blue-300 hover:text-white">
                      {card.linkLabel} →
                    </motion.a>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.div {...fadeUp} className="glass-panel overflow-hidden p-1">
            <iframe
              src={content.about.gettingHere.mapEmbedUrl || content.settings.links.mapsEmbedUrl}
              className="w-full h-72 rounded-[1.35rem]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Church Location"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel lg-iridescent p-10 text-center">
            {specularLine}
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold text-white mb-4">{content.about.network.title}</h2>
              <p className="text-white/60 leading-relaxed mb-4 text-sm">{content.about.network.description}</p>
              <motion.a {...subtleTap} href={content.about.network.linkUrl} target="_blank" rel="noreferrer" className="glass-action-soft inline-flex px-5 text-sm font-medium text-blue-300 hover:text-white">
                {content.about.network.linkLabel} →
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
