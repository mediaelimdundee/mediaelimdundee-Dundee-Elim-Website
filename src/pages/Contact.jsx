import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Send } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { contactInfoConfig } from '@/lib/sitePresentation';
import { createContactSubmission } from '@/lib/siteContentApi';
import { openMailto } from '@/lib/mailto';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { formatPhoneHref, resolveMediaSrc } from '@/lib/siteContentUtils';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

const inputClass = 'w-full rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' };

export default function Contact() {
  const { content } = useSiteContent();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured) {
        await createContactSubmission(form);
      } else {
        openMailto({
          to: content.settings.contact.email,
          subject: form.subject ? `Website contact: ${form.subject}` : `Website contact from ${form.name}`,
          body: [
            `Name: ${form.name}`,
            `Email: ${form.email}`,
            `Phone: ${form.phone || 'Not provided'}`,
            '',
            form.message,
          ].join('\n'),
        });
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to send your message.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20">
      <SEOHead title={content.contact.seo.title} description={content.contact.seo.description} path="/contact" />

      <div className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={resolveMediaSrc(content.contact.header.image)} alt={content.contact.header.image.alt || 'Contact Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>
        <div className="orb w-96 h-96 bg-cyan-700 top-0 right-1/4" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.contact.header.eyebrow}</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 mb-4">
            {content.contact.header.titleLead} <span className="text-gradient">{content.contact.header.titleHighlight}</span>
          </h1>
          <p className="text-white/55">{content.contact.header.description}</p>
        </div>
      </div>

      <div className="px-4 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {content.contact.infoCards.map((card, index) => {
              const style = contactInfoConfig[card.kind] || contactInfoConfig.address;
              const Icon = style.Icon;

              return (
                <motion.div key={`${card.kind}-${index}`} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} viewport={{ once: true }} className="lg-surface rounded-2xl p-7 relative overflow-hidden">
                  {specularLine}
                  <div className="p-3 rounded-xl inline-block mb-4" style={{ background: style.bg }}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{card.title}</h3>
                  {card.descriptionLines.length > 0 && (
                    <p className="text-white/55 text-sm leading-relaxed">
                      {card.descriptionLines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </p>
                  )}
                  {card.items.length > 0 && (
                    <div className="space-y-2 text-sm">
                      {card.items.map((item) => {
                        const isEmail = item.label.toLowerCase().includes('email');
                        const isPhone = item.label.toLowerCase().includes('phone');

                        return (
                          <div key={item.label} className="flex justify-between gap-3">
                            <span className="text-white/55">{item.label}</span>
                            {isEmail ? (
                              <a href={`mailto:${item.value}`} className="text-white font-medium hover:text-blue-300 transition-colors">{item.value}</a>
                            ) : isPhone ? (
                              <a href={`tel:${formatPhoneHref(item.value)}`} className="text-white font-medium hover:text-blue-300 transition-colors">{item.value}</a>
                            ) : (
                              <span className="text-white font-medium">{item.value}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {card.linkLabel && card.linkUrl && (
                    <motion.a whileTap={{ scale: 0.95 }} href={card.linkUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-blue-400 hover:text-white text-sm transition-colors">
                      {card.linkLabel} →
                    </motion.a>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="lg:col-span-3 lg-surface rounded-2xl p-8 relative overflow-hidden">
            {specularLine}
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="p-4 rounded-full mb-5" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{content.contact.form.successTitle}</h3>
                <p className="text-white/55">{content.contact.form.successDescription}</p>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="mt-6 text-blue-400 hover:text-white text-sm transition-colors">
                  {content.contact.form.resetLabel}
                </motion.button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-6">{content.contact.form.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Your Name *</label>
                      <input required type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} style={inputStyle} placeholder="John Smith" />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Email *</label>
                      <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} style={inputStyle} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Phone</label>
                      <input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={inputClass} style={inputStyle} placeholder="+44..." />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Subject</label>
                      <input type="text" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={inputClass} style={inputStyle} placeholder="How can we help?" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`${inputClass} resize-none`} style={inputStyle} placeholder="Your message..." />
                  </div>
                  {error && (
                    <div className="rounded-xl px-4 py-3 text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {error}
                    </div>
                  )}
                  <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className="w-full py-4 rounded-2xl lg-btn-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : content.contact.form.submitLabel}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <div className="px-4 mt-10">
        <div className="max-w-7xl mx-auto lg-surface rounded-2xl overflow-hidden p-1">
          <iframe src={content.contact.mapEmbedUrl || content.settings.links.mapsEmbedUrl} className="w-full h-72 rounded-xl" style={{ border: 0 }} allowFullScreen loading="lazy" title="Church Location" />
        </div>
      </div>
    </div>
  );
}
