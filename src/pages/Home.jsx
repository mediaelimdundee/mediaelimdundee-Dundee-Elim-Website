import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Mail, MapPin, Play, Youtube } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import PrayerRequestForm from '@/components/home/PrayerRequestForm';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { beliefConfig, quickInfoConfig } from '@/lib/sitePresentation';
import { normalizeSnapshotVideoSermons, useYoutubeSermons } from '@/lib/youtubeSermons';

function HeroSlideshow({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[current];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={`${activeSlide.caption}-${current}`}
          src={resolveMediaSrc(activeSlide.image)}
          alt={activeSlide.image.alt || activeSlide.caption}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
    </div>
  );
}

export default function Home() {
  const { content } = useSiteContent();
  const youtubeFeed = useYoutubeSermons(content.settings.links.youtubeChannelId);
  const fallbackVideos = normalizeSnapshotVideoSermons(content.sermons.videoSermons);
  const latestVideoId = youtubeFeed.videos[0]?.id || fallbackVideos[0]?.id || null;
  const trustPoints = [
    {
      title: content.home.hero.serviceBadgeLabel,
      value: `${content.home.hero.serviceBadgeDay} · ${content.home.hero.serviceBadgeTime}`,
      Icon: Play,
      bg: 'rgba(96,165,250,0.14)',
      color: 'text-blue-200',
    },
    {
      title: 'Find us',
      value: content.settings.contact.addressShort,
      Icon: MapPin,
      bg: 'rgba(56,189,248,0.12)',
      color: 'text-cyan-200',
    },
    {
      title: 'Get in touch',
      value: content.settings.contact.email,
      Icon: Mail,
      bg: 'rgba(167,139,250,0.14)',
      color: 'text-violet-200',
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <SEOHead title={content.home.seo.title} description={content.home.seo.description} path="/" />

      <section className="relative flex min-h-screen items-center justify-center px-4 pb-24 pt-28 sm:pt-32">
        <HeroSlideshow slides={content.home.hero.slides} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span
              className="inline-block rounded-full px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-blue-200"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}
            >
              {content.home.hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-6 mb-6 font-display text-5xl font-bold leading-[0.92] text-white glow-text sm:text-6xl lg:text-[5.35rem]"
          >
            {content.home.hero.titleLead}
            <br />
            <span className="text-gradient">{content.home.hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mb-8 max-w-3xl text-base leading-8 text-white/62 sm:text-xl"
          >
            {content.home.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link to={content.home.hero.primaryCtaPath} className="group flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base transition-all lg-btn-primary sm:text-lg">
                {content.home.hero.primaryCtaLabel}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link to={content.home.hero.secondaryCtaPath} className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base transition-all lg-btn-ghost sm:text-lg">
                <Play className="w-5 h-5" />
                {content.home.hero.secondaryCtaLabel}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none"
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/40 animate-pulse" />
          <span className="text-white/40 text-xs uppercase tracking-widest">{content.home.hero.scrollLabel}</span>
        </motion.div>
      </section>

      <section className="px-4 py-6 sm:py-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {content.home.quickInfo.items.map((item, index) => {
            const style = quickInfoConfig[item.kind] || quickInfoConfig.service;
            const Icon = style.Icon;

            return (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel flex items-center gap-4 p-6 transition-transform hover:scale-[1.02]"
              >
                <div className="p-3 rounded-xl shrink-0" style={{ background: style.bg }}>
                  <Icon className={`w-6 h-6 ${style.color}`} />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{item.title}</div>
                  <div className="text-white/50 text-xs mt-0.5">{item.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative order-1 lg:order-none"
          >
            <div className="absolute -inset-6 rounded-3xl" style={{ background: 'radial-gradient(circle, rgba(80,130,255,0.15) 0%, transparent 70%)' }} />
            <div className="relative rounded-3xl overflow-hidden lg-surface p-1.5">
              <img src={resolveMediaSrc(content.home.pastors.image)} alt={content.home.pastors.image.alt || content.home.pastors.imageTitle} className="rounded-2xl w-full object-cover object-top shadow-2xl" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl px-5 py-3 lg-surface">
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
              <div className="text-white font-semibold text-sm">{content.home.pastors.imageTitle}</div>
              <div className="text-blue-300/70 text-xs">{content.home.pastors.imageSubtitle}</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.home.pastors.eyebrow}</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-3 mb-6 leading-tight">
              {content.home.pastors.titleLead}
              <br />
              <span className="text-gradient">{content.home.pastors.titleHighlight}</span>
            </h2>
            {content.home.pastors.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-white/60 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {content.home.pastors.stats.map((item) => (
                <div key={item.label} className="lg-surface rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
                  <div className="font-display text-2xl font-bold text-gradient">{item.value}</div>
                  <div className="text-white/40 text-xs mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link to={content.home.pastors.ctaPath} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl lg-btn-ghost font-medium transition-all group text-sm">
                {content.home.pastors.ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.home.beliefs.eyebrow}</span>
            <h2 className="font-display text-4xl font-bold text-white mt-2">{content.home.beliefs.title}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {content.home.beliefs.items.map((item, index) => {
              const style = beliefConfig[item.kind] || beliefConfig.worship;
              const Icon = style.Icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="lg-surface lg-iridescent rounded-3xl p-8 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                  <div className="relative z-10">
                    <div className="p-4 rounded-2xl inline-block mb-5" style={{ background: style.bg }}>
                      <Icon className={`w-8 h-8 ${style.color}`} />
                    </div>
                    <h3 className="text-white font-display text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.home.gallery.eyebrow}</span>
            <h2 className="font-display text-4xl font-bold text-white mt-2">{content.home.gallery.title}</h2>
          </motion.div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              {content.home.gallery.topImages.map((asset, index) => (
                <motion.div
                  key={`${asset.url}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden aspect-[4/3]"
                >
                  <img src={resolveMediaSrc(asset)} alt={asset.alt || 'Life at Dundee Elim'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {content.home.gallery.bottomImages.map((asset, index) => (
                <motion.div
                  key={`${asset.url}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 + index * 0.08 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden aspect-[16/7]"
                >
                  <img src={resolveMediaSrc(asset)} alt={asset.alt || 'Life at Dundee Elim'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.home.media.eyebrow}</span>
                <h2 className="font-display text-3xl font-bold text-white mt-1">{content.home.media.title}</h2>
              </div>
              <a
                href={content.settings.links.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-white/30 hover:text-red-400 text-sm transition-colors"
              >
                <Youtube className="w-4 h-4" />
                {content.home.media.subscribeLabel}
              </a>
            </div>
            <div className="lg-surface rounded-3xl overflow-hidden glow-blue mb-4 p-1">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/40">
                {latestVideoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${latestVideoId}`}
                    title={content.home.media.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>
            </div>
            <Link to={content.home.media.viewAllPath} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl lg-btn-ghost text-sm font-medium transition-all">
              {content.home.media.viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2">
            <div className="lg-surface rounded-3xl p-7 h-full relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
              <div className="flex items-center gap-2 mb-5">
                <span className="text-white font-semibold text-sm">{content.home.weeklyRhythm.title}</span>
              </div>
              <div className="space-y-0.5">
                {content.home.weeklyRhythm.items.map((item) => (
                  <div key={`${item.name}-${item.day}`} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-white text-sm font-medium">{item.name}</div>
                      <div className="text-white/35 text-xs">{item.day}</div>
                    </div>
                    <div className="text-blue-300/80 text-sm font-semibold shrink-0 ml-3">{item.time}</div>
                  </div>
                ))}
              </div>
              <Link to={content.home.weeklyRhythm.footerPath} className="mt-4 flex items-center gap-1.5 text-white/30 hover:text-white text-xs transition-colors">
                {content.home.weeklyRhythm.footerLabel}
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PrayerRequestForm />

      <section className="px-4 pb-20 pt-12 sm:pt-14">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="glass-panel-strong lg-iridescent p-8 sm:p-10 lg:p-12"
          >
            <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="text-center lg:text-left">
                <span className="inline-block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-blue-200/75">
                  Plan Your Visit
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[3rem]">
                  {content.home.cta.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/60 sm:text-lg lg:max-w-xl">
                  {content.home.cta.description}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link to={content.home.cta.primaryPath} className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base lg-btn-primary transition-all">
                      {content.home.cta.primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <a
                      href={content.home.cta.secondaryUrl || content.settings.links.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base lg-btn-ghost transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      {content.home.cta.secondaryLabel}
                    </a>
                  </motion.div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {trustPoints.map((item, index) => {
                  const Icon = item.Icon;

                  return (
                    <div key={`closing-${item.title}-${index}`} className="glass-panel px-4 py-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl p-3" style={{ background: item.bg }}>
                          <Icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/40">{item.title}</div>
                          <div className="mt-1 text-sm font-medium leading-6 text-white/90">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
          {/* Hidden SVG Filter for Liquid Glass Dynamics */}
      <svg className="hidden">
        <filter id="liquid-distortion">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" values="0.015;0.025;0.015" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div> // This is the final closing div of the component
  );
}

  );
}
