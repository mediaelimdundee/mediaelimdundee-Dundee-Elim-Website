import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, CheckCircle, Send } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { openMailto } from '@/lib/mailto';
import { createPrayerSubmission } from '@/lib/siteContentApi';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { fadeUp, subtleTap } from '@/lib/motion';

const inputClass = "glass-input-field";

export default function PrayerRequestForm() {
  const { content } = useSiteContent();
  const [form, setForm] = useState({ name: '', email: '', request: '', is_private: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured) {
        await createPrayerSubmission(form);
      } else {
        openMailto({
          to: content.settings.contact.email,
          subject: form.is_private ? 'Private prayer request from website' : 'Prayer request from website',
          body: [
            `Name: ${form.name}`,
            `Email: ${form.email || 'Not provided'}`,
            `Private request: ${form.is_private ? 'Yes' : 'No'}`,
            '',
            form.request,
          ].join('\n'),
        });
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to send prayer request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          className="glass-panel-strong p-10 relative"
          style={{
            boxShadow: '0 1px 0 0 rgba(255,255,255,0.12) inset, 0 24px 80px rgba(0,0,0,0.5)'
          }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.07), rgba(59,130,246,0.05), rgba(168,85,247,0.04))' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="glass-icon-badge" style={{ background: 'rgba(168,85,247,0.15)' }}>
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-purple-300/70 text-xs uppercase tracking-widest font-medium">{content.home.prayerRequest.eyebrow}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3 mb-2">{content.home.prayerRequest.title}</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              {content.home.prayerRequest.description}
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 text-center">
                <div className="p-4 rounded-full mb-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">{content.home.prayerRequest.successTitle}</h3>
                <p className="text-white/50 text-sm">{content.home.prayerRequest.successDescription}</p>
                  <motion.button
                    {...subtleTap}
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', request: '', is_private: false }); }}
                    className="glass-action-soft mt-6 px-5 text-sm text-purple-300 hover:text-white"
                  >
                    {content.home.prayerRequest.resetLabel}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Your Name *</label>
                      <input required type="text" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="First name is fine" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Email (optional)</label>
                      <input type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="For a personal response" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Your Prayer Request *</label>
                    <textarea required rows={4} value={form.request}
                      onChange={e => setForm({ ...form, request: e.target.value })}
                      placeholder="Share what's on your heart..." className={inputClass} />
                  </div>

                  <button type="button" onClick={() => setForm({ ...form, is_private: !form.is_private })}
                    className="glass-inline-panel flex w-full items-center gap-3 px-4 py-3 text-left transition-all"
                    style={form.is_private
                      ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }
                      : undefined}>
                    <Lock className={`w-4 h-4 shrink-0 ${form.is_private ? 'text-purple-400' : 'text-white/30'}`} />
                    <div>
                      <div className={`text-sm font-medium ${form.is_private ? 'text-white' : 'text-white/55'}`}>{content.home.prayerRequest.privacyLabel}</div>
                      <div className="text-xs text-white/30 mt-0.5">{content.home.prayerRequest.privacyDescription}</div>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${form.is_private ? 'border-purple-400 bg-purple-400' : 'border-white/20'}`}>
                      {form.is_private && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>

                  {error && (
                    <div className="rounded-[1.1rem] px-4 py-3 text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {error}
                    </div>
                  )}

                  <motion.button {...subtleTap} type="submit" disabled={loading}
                    className="glass-action-primary w-full disabled:opacity-50 text-white"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))', border: '1px solid rgba(168,85,247,0.4)', boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 20px rgba(139,92,246,0.3)' }}>
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : content.home.prayerRequest.submitLabel}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
