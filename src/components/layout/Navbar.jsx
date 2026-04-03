import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Sermons', path: '/sermons' },
  { label: 'Events', path: '/events' },
  { label: 'Ministries', path: '/ministries' },
  { label: 'Give', path: '/give' },
  { label: 'Safeguarding', path: '/safeguarding' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { content } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`w-full max-w-6xl transition-all duration-500 rounded-3xl ${
          scrolled
            ? 'lg-surface-raised'
            : 'lg-surface'
        }`}
        style={{ position: 'relative' }}
      >
        {/* Specular top highlight */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />

        <div className="pr-4 sm:pr-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src={resolveMediaSrc(content.settings.branding.logo)} alt={content.settings.siteName} className="h-20 w-20 object-contain" />
              <div className="hidden sm:block -ml-3">
                <div className="font-display text-xl font-bold text-white leading-tight">{content.settings.shortName}</div>
                <div className="text-xs text-blue-300/80 tracking-widest uppercase">{content.settings.tagline}</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {location.pathname === link.path && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 space-y-0.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'text-white bg-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/06'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
