import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { aboutTravelConfig } from '@/lib/sitePresentation';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
);

export default function About() {
  const { content } = useSiteContent();

  return (
    <div className="pb-20">
      <SEOHead title={content.about.seo.title} description={content.about.seo.description} path="/about" />

      <div className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={resolveMediaSrc(content.about.header.image)} alt={content.about.header.image.alt || 'About Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>
        <div className="orb w-[500px] h-[500px] bg-blue-700 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.about.header.eyebrow}</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 mb-6">
            {content.about.header.titleLead} <span className="text-gradient">{content.about.header.titleHighlight}</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">{content.about.header.description}</p>
        </div>
      </div>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-4 rounded-3xl" style={{ background: 'radial-gradient(circle, rgba(80,130,255,0.12) 0%, transparent 70%)' }} />
            <div className="relative lg-surface rounded-3xl p-1.5">
              <img src={resolveMediaSrc(content.about.pastors.image)} alt={content.about.pastors.image.alt || 'Pastors'} className="rounded-2xl w-full object-cover shadow-2xl" />
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
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
              <motion.div key={item.number} {...fadeUp} className="lg-surface rounded-2xl p-6 relative overflow-hidden">
                {specularLine}
                <div className="text-4xl font-display font-bold mb-3" style={{ color: 'rgba(96,165,250,0.2)' }}>{item.number}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-5 lg-surface rounded-2xl p-6 relative overflow-hidden">
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
                <motion.div key={card.title} {...fadeUp} className="lg-surface rounded-2xl p-8 relative overflow-hidden">
                  {specularLine}
                  <div className="p-3 rounded-xl inline-block mb-4" style={{ background: style.bg }}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{card.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{card.description}</p>
                  {card.linkLabel && card.linkUrl && (
                    <motion.a whileTap={{ scale: 0.95 }} href={card.linkUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-blue-400 hover:text-white text-sm transition-colors">
                      {card.linkLabel} →
                    </motion.a>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.div {...fadeUp} className="lg-surface rounded-2xl overflow-hidden p-1">
            <iframe
              src={content.about.gettingHere.mapEmbedUrl || content.settings.links.mapsEmbedUrl}
              className="w-full h-72 rounded-xl"
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
          <div className="lg-surface lg-iridescent rounded-3xl p-10 text-center relative overflow-hidden">
            {specularLine}
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold text-white mb-4">{content.about.network.title}</h2>
              <p className="text-white/60 leading-relaxed mb-4 text-sm">{content.about.network.description}</p>
              <motion.a whileTap={{ scale: 0.95 }} href={content.about.network.linkUrl} target="_blank" rel="noreferrer" className="inline-block text-blue-400 hover:text-white font-medium transition-colors text-sm">
                {content.about.network.linkLabel} →
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
