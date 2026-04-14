import { createClient } from '@supabase/supabase-js';

function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function asDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function asRfc2822(value) {
  return asDate(value).toUTCString();
}

function baseUrlFromContent(content) {
  return (
    content?.settings?.seo?.siteUrl
    || content?.sermons?.podcast?.website
    || process.env.URL
    || ''
  ).replace(/\/+$/, '');
}

function mimeTypeFromUrl(url = '') {
  const cleanUrl = String(url).split('?')[0].toLowerCase();

  if (cleanUrl.endsWith('.m4a')) return 'audio/mp4';
  if (cleanUrl.endsWith('.wav')) return 'audio/wav';
  if (cleanUrl.endsWith('.ogg')) return 'audio/ogg';
  if (cleanUrl.endsWith('.aac')) return 'audio/aac';
  if (cleanUrl.endsWith('.flac')) return 'audio/flac';

  return 'audio/mpeg';
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) {
    return '';
  }

  const wholeSeconds = Number(seconds);

  if (!Number.isFinite(wholeSeconds) || wholeSeconds < 0) {
    return '';
  }

  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainder = wholeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

async function resolveContentLengths(episodes) {
  return Promise.all(episodes.map(async (episode) => {
    if (!episode.audio_url) {
      return { ...episode, contentLength: '0' };
    }

    try {
      const response = await fetch(episode.audio_url, { method: 'HEAD' });
      return {
        ...episode,
        contentLength: response.headers.get('content-length') || '0',
      };
    } catch {
      return { ...episode, contentLength: '0' };
    }
  }));
}

function buildChannelXml({ content, feedUrl, episodes }) {
  const settings = content?.settings || {};
  const podcast = content?.sermons?.podcast || {};
  const siteUrl = baseUrlFromContent(content) || process.env.URL || '';
  const title = podcast.title || settings.siteName || 'Podcast';
  const description = podcast.description || settings.tagline || 'Podcast feed';
  const author = podcast.author || podcast.churchName || settings.siteName || title;
  const ownerEmail = podcast.email || settings.contact?.email || '';
  const language = podcast.language || 'en-gb';
  const category = podcast.category || 'Religion & Spirituality';
  const copyright = podcast.copyright || podcast.churchName || settings.siteName || '';
  const imageUrl = (
    podcast.coverArt?.url
    || podcast.coverArt?.path
    || settings.seo?.defaultImage?.url
    || settings.branding?.logo?.url
    || settings.branding?.logo?.path
    || ''
  );

  const itemXml = episodes.map((episode) => {
    const descriptionText = episode.show_notes || episode.description || episode.title || 'Audio sermon';
    const duration = formatDuration(episode.duration_seconds);
    const itemLink = siteUrl ? `${siteUrl}/sermons` : feedUrl;

    return `
    <item>
      <title>${xmlEscape(episode.title || 'Untitled Episode')}</title>
      <description>${xmlEscape(descriptionText)}</description>
      <link>${xmlEscape(itemLink)}</link>
      <guid isPermaLink="false">${xmlEscape(episode.id || episode.audio_url || itemLink)}</guid>
      <pubDate>${xmlEscape(asRfc2822(episode.publishedAt || episode.date))}</pubDate>
      <enclosure url="${xmlEscape(episode.audio_url || '')}" length="${xmlEscape(episode.contentLength || '0')}" type="${xmlEscape(mimeTypeFromUrl(episode.audio_url))}" />
      <itunes:author>${xmlEscape(episode.speaker || author)}</itunes:author>
      <itunes:summary>${xmlEscape(descriptionText)}</itunes:summary>
      <itunes:explicit>false</itunes:explicit>
      ${duration ? `<itunes:duration>${xmlEscape(duration)}</itunes:duration>` : ''}
      ${episode.episode_number ? `<itunes:episode>${xmlEscape(String(episode.episode_number))}</itunes:episode>` : ''}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(siteUrl || feedUrl)}</link>
    <description>${xmlEscape(description)}</description>
    <language>${xmlEscape(language)}</language>
    <lastBuildDate>${xmlEscape(asRfc2822(content?.published_at || new Date().toISOString()))}</lastBuildDate>
    <generator>Dundee Elim Website</generator>
    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />
    <itunes:author>${xmlEscape(author)}</itunes:author>
    <itunes:summary>${xmlEscape(description)}</itunes:summary>
    <itunes:category text="${xmlEscape(category)}" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    ${copyright ? `<copyright>${xmlEscape(copyright)}</copyright>` : ''}
    ${ownerEmail ? `<itunes:owner><itunes:name>${xmlEscape(author)}</itunes:name><itunes:email>${xmlEscape(ownerEmail)}</itunes:email></itunes:owner>` : ''}
    ${imageUrl ? `<itunes:image href="${xmlEscape(imageUrl)}" />` : ''}
    ${imageUrl ? `<image><url>${xmlEscape(imageUrl)}</url><title>${xmlEscape(title)}</title><link>${xmlEscape(siteUrl || feedUrl)}</link></image>` : ''}
    ${itemXml}
  </channel>
</rss>`;
}

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: 'Method not allowed.',
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      statusCode: 500,
      headers,
      body: 'Missing Supabase configuration for podcast feed.',
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from('site_content_versions')
      .select('content, published_at')
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.content) {
      return {
        statusCode: 404,
        headers,
        body: 'Published site content was not found.',
      };
    }

    const content = data.content;
    const feedBaseUrl = baseUrlFromContent(content) || process.env.URL || '';
    const feedUrl = `${feedBaseUrl}/.netlify/functions/podcast-rss`;
    const publishedEpisodes = (content?.sermons?.audioSermons || [])
      .filter((episode) => episode?.status === 'published' && episode?.audio_url)
      .sort((left, right) => String(right.date || '').localeCompare(String(left.date || '')));
    const episodesWithLengths = await resolveContentLengths(publishedEpisodes);
    const body = buildChannelXml({
      content: { ...content, published_at: data.published_at },
      feedUrl,
      episodes: episodesWithLengths,
    });

    return {
      statusCode: 200,
      headers,
      body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: `Podcast feed error: ${error.message || 'Unexpected error.'}`,
    };
  }
}
