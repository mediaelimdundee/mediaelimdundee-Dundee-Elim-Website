function decodeXml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
  return decodeXml(match?.[1] || '');
}

function extractThumbnail(block, videoId) {
  const explicitThumbnail = block.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];
  return explicitThumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
}

function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
    const block = match[1];
    const id = extractTag(block, 'yt:videoId');

    return {
      id,
      title: extractTag(block, 'title'),
      publishedAt: extractTag(block, 'published'),
      thumbnailUrl: extractThumbnail(block, id),
      watchUrl: id ? `https://www.youtube.com/watch?v=${id}` : '',
    };
  }).filter((item) => item.id && item.title);
}

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed.' }),
    };
  }

  const channelId = event.queryStringParameters?.channelId;

  if (!channelId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing channelId query parameter.' }),
    };
  }

  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);

    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Unable to load YouTube feed.' }),
      };
    }

    const xml = await response.text();
    const videos = parseFeed(xml);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ videos }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Unexpected YouTube feed error.' }),
    };
  }
}
