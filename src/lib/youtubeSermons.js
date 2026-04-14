import { useEffect, useMemo, useState } from 'react';
import { filterPublishedItems } from '@/lib/siteContentUtils';

function sortByPublishedAtDesc(left, right) {
  return String(right.publishedAt || '').localeCompare(String(left.publishedAt || ''));
}

export function normalizeSnapshotVideoSermons(items) {
  return filterPublishedItems(items).map((item) => ({
    id: item.id,
    title: item.title,
    publishedAt: item.date || item.publishedAt || '',
    thumbnailUrl: item.thumbnailUrl || (item.id ? `https://img.youtube.com/vi/${item.id}/mqdefault.jpg` : ''),
    watchUrl: item.id ? `https://www.youtube.com/watch?v=${item.id}` : '',
  })).sort(sortByPublishedAtDesc);
}

export async function fetchYoutubeSermons(channelId) {
  if (!channelId) {
    return [];
  }

  const response = await fetch(`/.netlify/functions/youtube-sermons?channelId=${encodeURIComponent(channelId)}`);

  if (!response.ok) {
    throw new Error('Unable to load YouTube sermons.');
  }

  const payload = await response.json();
  return Array.isArray(payload?.videos) ? payload.videos.sort(sortByPublishedAtDesc) : [];
}

export function useYoutubeSermons(channelId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!channelId) {
        if (active) {
          setVideos([]);
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const nextVideos = await fetchYoutubeSermons(channelId);

        if (!active) {
          return;
        }

        setVideos(nextVideos);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setVideos([]);
        setError(loadError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [channelId]);

  return useMemo(() => ({
    videos,
    loading,
    error,
  }), [videos, loading, error]);
}
