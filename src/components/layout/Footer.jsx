import { Link } from 'react-router-dom';
import { MapPin, Clock, Mail, Youtube, Facebook } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

export default function Footer() {
  const { content } = useSiteContent();
  const serviceCard = content.contact.infoCards.find((card) => card.kind === 'service');

  return (
    <footer className="relative">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />
      <div className="lg-surface-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="flex flex-col items-center text-center -mt-8">
              <div className="flex flex-col items-center mb-4">
                <img src={resolveMediaSrc(content.settings.branding.logo)} alt={content.settings.siteName} className="h-20 w-20 object-contain" />
                <div className="text-center -mt-1">
                  <div className="font-display text-xl font-bold text-white leading-tight">{content.settings.shortName}</div>
                  <div className="text-xs text-blue-300/70 tracking-widest uppercase">{content.settings.tagline}</div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {content.settings.footerDescription}
              </p>
              <div className="flex gap-2 mt-5 justify-center">
                <a href={content.settings.links.youtubeUrl} target="_blank" rel="noreferrer"
                  className="p-2 rounded-xl text-white/50 hover:text-red-400 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Youtube className="w-4 h-4" />
                </a>
                <a href={content.settings.links.facebookUrl} target="_blank" rel="noreferrer"
                  className="p-2 rounded-xl text-white/50 hover:text-blue-400 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white/80 font-semibold mb-4 uppercase tracking-wider text-xs">Quick Links</h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[['Home', '/'], ['About', '/about'], ['Sermons', '/sermons'], ['Events', '/events'], ['Ministries', '/ministries'], ['Give', '/give'], ['Safeguarding', '/safeguarding'], ['Contact', '/contact']].map(([label, path]) => (
                  <li key={path}>
                    <Link to={path} className="text-sm transition-colors text-white/50 hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Times */}
            <div>
              <h3 className="text-white/80 font-semibold mb-4 uppercase tracking-wider text-xs">Services</h3>
              <div className="space-y-3">
                {(serviceCard?.items || []).map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-white/80 text-sm font-medium">{item.label}</div>
                      <div className="text-white/40 text-xs">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white/80 font-semibold mb-4 uppercase tracking-wider text-xs">Find Us</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
                  <div className="text-white/50 text-sm">{content.settings.contact.addressShort}</div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
                  <a href={`mailto:${content.settings.contact.email}`} className="text-white/50 text-sm hover:text-blue-300 transition-colors">
                    {content.settings.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/30 text-xs">© {new Date().getFullYear()} {content.settings.siteName}. All rights reserved.</p>
            <p className="text-white/30 text-xs">Part of <a href={content.settings.links.elimUrl} target="_blank" rel="noreferrer" className="hover:text-blue-300 transition-colors">Elim Pentecostal Churches</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
