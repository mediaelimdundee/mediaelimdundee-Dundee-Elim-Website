import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSiteContent } from '@/content/defaultSiteContent';
import { fetchPublishedContent } from '@/lib/siteContentApi';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultSiteContent);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('fallback');

  async function refreshContent() {
    setLoading(true);

    const result = await fetchPublishedContent();

    setContent(result.content);
    setMetadata(result.metadata);
    setError(result.error);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    refreshContent();
  }, []);

  const value = useMemo(() => ({
    content,
    metadata,
    loading,
    error,
    source,
    refreshContent,
  }), [content, metadata, loading, error, source]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error('useSiteContent must be used inside SiteContentProvider.');
  }

  return context;
}
