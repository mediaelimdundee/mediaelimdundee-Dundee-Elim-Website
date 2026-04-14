import {
  attachEpisodesToJobs,
  createServerClient,
  extractBearerToken,
  listExtractionJobs,
  verifyAdminBearerToken,
} from '../../shared/sermonExtractionServer.mjs';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' });
  }

  try {
    const accessToken = extractBearerToken(event.headers);
    await verifyAdminBearerToken(accessToken);

    const episodeId = event.queryStringParameters?.episodeId || '';
    const episodeIds = String(event.queryStringParameters?.episodeIds || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const client = createServerClient({ accessToken });
    const jobs = await attachEpisodesToJobs(
      client,
      await listExtractionJobs(client, {
        episodeId: episodeId || undefined,
        episodeIds: episodeIds.length > 0 ? episodeIds : undefined,
      }),
    );

    if (episodeId) {
      return json(200, {
        job: jobs[0] || null,
      });
    }

    return json(200, {
      jobs,
    });
  } catch (error) {
    return json(500, { error: error.message || 'Unable to fetch sermon extraction status.' });
  }
}
