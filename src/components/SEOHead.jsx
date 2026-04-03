import { useEffect } from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

export default function SEOHead({ title = '', description = '', path = '' }) {
  const { content } = useSiteContent();
  const SITE_NAME = content.settings.siteName;
  const DEFAULT_DESC = content.settings.seo.defaultDescription;
  const DEFAULT_IMAGE = `${content.settings.seo.siteUrl}${resolveMediaSrc(content.settings.seo.defaultImage)}`;
  const SITE_URL = content.settings.seo.siteUrl;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : content.settings.seo.defaultTitle;
  const desc = description || DEFAULT_DESC;
  const canonical = `${SITE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', DEFAULT_IMAGE);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setCanonical(canonical);
  }, [fullTitle, desc, canonical]);

  return null;
}

function setMeta(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
