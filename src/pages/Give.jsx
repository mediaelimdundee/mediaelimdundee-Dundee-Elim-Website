import { motion } from 'framer-motion';
import { ArrowRight, Globe, Heart, Mail, Phone } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { giveMethodConfig } from '@/lib/sitePresentation';
import { fadeUp, subtleTap } from '@/lib/motion';
import { formatPhoneHref, resolveMediaSrc } from '@/lib/siteContentUtils';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Give() {
  const { content } = useSiteContent();

  return (
    <div className="pb-20">
      <SEOHead title={content.give.seo.title} description={content.give.seo.description} path="/give" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.give.header.image)} alt={content.give.header.image.alt || 'Giving at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.give.header.eyebrow}</span>
          <h1 className="page-title">
            {content.give.header.titleLead} <span className="text-gradient">{content.give.header.titleHighlight}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg italic leading-8 text-white/58">{content.give.header.quote}</p>
          <p className="mt-2 text-sm font-medium text-blue-300/72">— {content.give.header.quoteCitation}</p>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel-strong mb-10 p-10 text-center">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))' }} />
            <div className="relative z-10">
              <Heart className="w-10 h-10 text-red-400 mx-auto mb-5" />
              <blockquote className="font-display text-xl sm:text-2xl text-white/90 italic mb-4 leading-relaxed">{content.give.scripture.quote}</blockquote>
              <cite className="text-blue-300/70 text-sm">— {content.give.scripture.citation}</cite>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center">{content.give.methodsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.give.methods.map((method, index) => {
              const style = giveMethodConfig[method.kind] || giveMethodConfig.online;
              const Icon = style.Icon;

              return (
                <motion.div key={`${method.kind}-${index}`} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.06 }} className="glass-panel p-8">
                  <div className="glass-icon-badge mb-5" style={{ background: style.bg }}>
                    <Icon className={`w-7 h-7 ${style.color}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{method.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed mb-4">{method.description}</p>
                  {method.kind === 'online' && method.ctaLabel && method.ctaUrl && (
                    <motion.a {...subtleTap} href={method.ctaUrl} target="_blank" rel="noreferrer" className="glass-action-primary px-5 text-sm font-semibold">
                      {method.ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </motion.a>
                  )}
                  {method.kind === 'bank' && (
                    <div className="glass-inline-panel mb-4 space-y-2 p-4 text-sm">
                      {method.contactEmail && (
                        <div className="flex items-center gap-2 text-white/60">
                          <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                          <a href={`mailto:${method.contactEmail}`} className="hover:text-blue-300 transition-colors">{method.contactEmail}</a>
                        </div>
                      )}
                      {method.contactPhone && (
                        <div className="flex items-center gap-2 text-white/60">
                          <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                          <a href={`tel:${formatPhoneHref(method.contactPhone)}`} className="hover:text-blue-300 transition-colors">{method.contactPhone}</a>
                        </div>
                      )}
                    </div>
                  )}
                  {method.kind === 'inperson' && (
                    <div className="glass-inline-panel p-4 text-sm">
                      {method.addressLines.map((line) => (
                        <p key={line} className={line === method.addressLines[0] ? 'text-white font-medium mb-1' : 'text-white/50'}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
            <div className="glass-icon-badge shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <Globe className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{content.give.giftAid.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-4">{content.give.giftAid.description}</p>
              <motion.a {...subtleTap} href={content.give.giftAid.ctaUrl} target="_blank" rel="noreferrer" className="glass-action-soft inline-flex px-5 text-sm font-medium text-green-300 hover:text-white" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {content.give.giftAid.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center">{content.give.impact.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {content.give.impact.items.map((item) => (
              <div key={item.label} className="glass-panel p-6 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-white/60 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="glass-panel section-inner-narrow p-8 text-center">
          <h3 className="text-white font-semibold text-lg mb-2">{content.give.contactCta.title}</h3>
          <p className="text-white/50 text-sm mb-5">{content.give.contactCta.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a {...subtleTap} href={`mailto:${content.settings.contact.email}`} className="glass-action-soft px-5 text-sm font-medium text-blue-300 hover:text-white">
              <Mail className="w-4 h-4" />
              {content.settings.contact.email}
            </motion.a>
            <motion.a {...subtleTap} href={`tel:${formatPhoneHref(content.settings.contact.phoneHref || content.settings.contact.phoneDisplay)}`} className="glass-action-soft px-5 text-sm font-medium text-blue-300 hover:text-white">
              <Phone className="w-4 h-4" />
              {content.settings.contact.phoneDisplay}
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
