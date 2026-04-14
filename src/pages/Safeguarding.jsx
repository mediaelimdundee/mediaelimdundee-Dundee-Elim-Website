import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { safeguardingActionStyles, safeguardingResourceConfig } from '@/lib/sitePresentation';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Safeguarding() {
  const { content } = useSiteContent();

  return (
    <div className="pb-20">
      <SEOHead title={content.safeguarding.seo.title} description={content.safeguarding.seo.description} path="/safeguarding" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.safeguarding.header.image)} alt={content.safeguarding.header.image.alt || 'Safeguarding at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.safeguarding.header.eyebrow}</span>
          <h1 className="page-title">
            {content.safeguarding.header.titleLead} <span className="text-gradient">{content.safeguarding.header.titleHighlight}</span>
          </h1>
          <p className="page-description">{content.safeguarding.header.description}</p>
        </div>
      </div>

      <section className="section-wrap">
        <div className="section-inner-narrow">
          <motion.div {...fadeUp} className="glass-panel-strong p-10">
            {specularLine}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(6,182,212,0.04))' }} />
            <div className="relative z-10">
              <div className="p-3 rounded-xl inline-block mb-5" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-5">{content.safeguarding.statement.title}</h2>
              <div className="space-y-4 text-white/60 leading-relaxed text-sm">
                {content.safeguarding.statement.paragraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 20)}`} className={index === content.safeguarding.statement.paragraphs.length - 1 ? 'text-white font-medium' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner-narrow">
          <div className="section-heading">
            <h2 className="section-title text-2xl sm:text-3xl">{content.safeguarding.resourcesTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.safeguarding.resources.map((resource, index) => {
              const style = safeguardingResourceConfig[resource.kind] || safeguardingResourceConfig.elim;
              const action = safeguardingActionStyles[resource.kind] || safeguardingActionStyles.elim;
              const Icon = style.Icon;

              return (
                <motion.div key={`${resource.kind}-${index}`} {...fadeUp} transition={{ delay: index * 0.1, duration: 0.6 }} className="glass-panel flex flex-col p-7">
                  {specularLine}
                  <div className="p-3 rounded-xl inline-block mb-4" style={{ background: style.bg }}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{resource.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">{resource.description}</p>
                  <a href={resource.ctaUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${action.className}`} style={action.style}>
                    {resource.ctaLabel}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-wrap pt-6">
        <div className="section-inner-narrow">
          <div className="glass-panel p-8 text-center">
            {specularLine}
            <h3 className="text-white font-semibold text-lg mb-2">{content.safeguarding.contact.title}</h3>
            <p className="text-white/50 text-sm mb-5">{content.safeguarding.contact.description}</p>
            <a href={`mailto:${content.settings.contact.email}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-blue-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {content.safeguarding.contact.buttonLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
