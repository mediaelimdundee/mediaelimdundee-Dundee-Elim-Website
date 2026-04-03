import { motion } from 'framer-motion';
import { ArrowRight, Globe, Heart, Mail, Phone } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { giveMethodConfig } from '@/lib/sitePresentation';
import { formatPhoneHref, resolveMediaSrc } from '@/lib/siteContentUtils';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Give() {
  const { content } = useSiteContent();

  return (
    <div className="pb-20">
      <SEOHead title={content.give.seo.title} description={content.give.seo.description} path="/give" />

      <div className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={resolveMediaSrc(content.give.header.image)} alt={content.give.header.image.alt || 'Giving at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>
        <div className="orb w-96 h-96 bg-green-800 top-0 right-1/3" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.give.header.eyebrow}</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 mb-4">
            {content.give.header.titleLead} <span className="text-gradient">{content.give.header.titleHighlight}</span>
          </h1>
          <p className="text-white/55 max-w-3xl mx-auto text-lg leading-relaxed italic">{content.give.header.quote}</p>
          <p className="text-blue-300/70 text-sm mt-2 font-medium">— {content.give.header.quoteCitation}</p>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="lg-surface rounded-3xl p-10 text-center relative overflow-hidden mb-10">
            {specularLine}
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
          <h2 className="font-display text-3xl font-bold text-white text-center mb-10">{content.give.methodsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.give.methods.map((method, index) => {
              const style = giveMethodConfig[method.kind] || giveMethodConfig.online;
              const Icon = style.Icon;

              return (
                <motion.div key={`${method.kind}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="lg-surface rounded-2xl p-8 relative overflow-hidden">
                  {specularLine}
                  <div className="p-3 rounded-xl inline-block mb-5" style={{ background: style.bg }}>
                    <Icon className={`w-7 h-7 ${style.color}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{method.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed mb-4">{method.description}</p>
                  {method.kind === 'online' && method.ctaLabel && method.ctaUrl && (
                    <motion.a whileTap={{ scale: 0.95 }} href={method.ctaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl lg-btn-primary text-sm font-semibold transition-all">
                      {method.ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </motion.a>
                  )}
                  {method.kind === 'bank' && (
                    <div className="rounded-xl p-4 text-sm space-y-2 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                    <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
          <div className="lg-surface rounded-2xl p-8 flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden">
            {specularLine}
            <div className="p-3 rounded-xl shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <Globe className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{content.give.giftAid.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-4">{content.give.giftAid.description}</p>
              <motion.a whileTap={{ scale: 0.95 }} href={content.give.giftAid.ctaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-green-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {content.give.giftAid.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-10">{content.give.impact.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {content.give.impact.items.map((item) => (
              <div key={item.label} className="lg-surface rounded-2xl p-6 text-center relative overflow-hidden">
                {specularLine}
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-white/60 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto lg-surface rounded-2xl p-8 text-center relative overflow-hidden">
          {specularLine}
          <h3 className="text-white font-semibold text-lg mb-2">{content.give.contactCta.title}</h3>
          <p className="text-white/50 text-sm mb-5">{content.give.contactCta.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a whileTap={{ scale: 0.95 }} href={`mailto:${content.settings.contact.email}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-blue-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Mail className="w-4 h-4" />
              {content.settings.contact.email}
            </motion.a>
            <motion.a whileTap={{ scale: 0.95 }} href={`tel:${formatPhoneHref(content.settings.contact.phoneHref || content.settings.contact.phoneDisplay)}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-blue-300 hover:text-white text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Phone className="w-4 h-4" />
              {content.settings.contact.phoneDisplay}
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
