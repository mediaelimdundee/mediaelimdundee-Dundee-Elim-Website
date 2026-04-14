// @ts-nocheck
import { requireSupabase } from '@/lib/supabaseClient';

const FUNCTION_BASE_PATH = '/.netlify/functions';

async function getAccessToken() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('You must be signed in to use sermon extraction.');
  }

  return accessToken;
}

async function parseFunctionError(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => ({}));
    return data.error || data.message || `Request failed (${response.status}).`;
  }

  if (contentType.includes('text/html')) {
    return 'Sermon extraction backend is not mounted. Restart the dev server so the local Netlify function bridge loads.';
  }

  const text = await response.text().catch(() => '');
  return text || `Request failed (${response.status}).`;
}

async function callFunction(name, { method = 'GET', body, searchParams } = {}) {
  const accessToken = await getAccessToken();
  const url = new URL(`${FUNCTION_BASE_PATH}/${name}`, window.location.origin);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseFunctionError(response));
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(await parseFunctionError(response));
  }

  return response.json();
}

export function dispatchSermonExtraction(payload) {
  return callFunction('sermon-extraction-dispatch', {
    method: 'POST',
    body: payload,
  });
}

export function fetchSermonExtractionStatus({ episodeId, episodeIds } = {}) {
  return callFunction('sermon-extraction-status', {
    searchParams: {
      episodeId,
      episodeIds: episodeIds?.length ? episodeIds.join(',') : '',
    },
  });
}
