import { createClient } from '@supabase/supabase-js';
import { defaultSiteContent } from '../src/content/defaultSiteContent.js';
import { parseSiteContent } from '../src/content/siteContentSchema.js';
import { buildYoutubeThumbnailUrl, extractYoutubeVideoId } from '../src/lib/sermonExtraction.js';

export const CONTENT_TABLE = 'site_content_versions';
export const JOB_TABLE = 'sermon_extraction_jobs';
export const MEDIA_BUCKET = 'site-media';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getEnv(...names) {
  for (const name of names) {
    if (process.env[name]) {
      return process.env[name];
    }
  }

  return '';
}

function getRequiredEnv(...names) {
  const value = getEnv(...names);

  if (!value) {
    throw new Error(`Missing required environment variable: ${names.join(' or ')}`);
  }

  return value;
}

function getSupabaseUrl() {
  return getRequiredEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
}

function getSupabaseAnonKey() {
  return getRequiredEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
}

function createSupabaseClient(url, key, options = {}) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      ...(options.auth || {}),
    },
    ...options,
  });
}

function sortEpisodesByDateDesc(left, right) {
  return String(right?.date || '').localeCompare(String(left?.date || ''));
}

function cleanString(value) {
  return String(value || '').trim();
}

function cleanNullableInteger(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : null;
}

export function extractBearerToken(headersOrToken) {
  if (!headersOrToken) {
    return '';
  }

  if (typeof headersOrToken === 'string') {
    return headersOrToken.replace(/^Bearer\s+/i, '').trim();
  }

  const authorization = headersOrToken.authorization || headersOrToken.Authorization || '';
  return authorization.replace(/^Bearer\s+/i, '').trim();
}

export function createEpisodeId() {
  return `audio-${crypto.randomUUID()}`;
}

export function hasPublicClientCredentials() {
  return Boolean(getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') && getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'));
}

export function hasServiceRoleCredentials() {
  return Boolean(getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') && getEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function createPublicClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseAnonKey());
}

export function createServiceRoleClient() {
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createSupabaseClient(getSupabaseUrl(), serviceRoleKey);
}

export function createAccessTokenClient(accessToken) {
  if (!accessToken) {
    throw new Error('Missing access token for authenticated Supabase client.');
  }

  return createSupabaseClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export function createServerClient({ accessToken = '', preferServiceRole = false } = {}) {
  if (preferServiceRole && hasServiceRoleCredentials()) {
    return createServiceRoleClient();
  }

  if (accessToken) {
    if (!hasPublicClientCredentials()) {
      if (hasServiceRoleCredentials()) {
        return createServiceRoleClient();
      }

      throw new Error('Missing Supabase public credentials for authenticated server access.');
    }

    return createAccessTokenClient(accessToken);
  }

  if (hasServiceRoleCredentials()) {
    return createServiceRoleClient();
  }

  if (hasPublicClientCredentials()) {
    return createPublicClient();
  }

  throw new Error('Missing Supabase credentials for sermon extraction.');
}

export async function verifyAdminBearerToken(headersOrToken) {
  const accessToken = extractBearerToken(headersOrToken);

  if (!accessToken) {
    throw new Error('Missing Authorization bearer token.');
  }

  const client = hasPublicClientCredentials() ? createPublicClient() : createServiceRoleClient();
  const { data, error } = await client.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new Error('Invalid or expired admin session.');
  }

  return data.user;
}

export function hasGitHubWorkflowCredentials() {
  return Boolean(
    getEnv('GITHUB_ACTIONS_TRIGGER_TOKEN', 'GITHUB_TOKEN')
    && getEnv('GITHUB_REPOSITORY_FULL_NAME'),
  );
}

export function normalizeEpisodeInput(payload = {}) {
  const videoId = cleanString(payload.video_id || extractYoutubeVideoId(payload.youtube_url));
  const existingStatus = cleanString(payload.status);
  const thumbnailUrl = cleanString(payload.thumbnailUrl) || buildYoutubeThumbnailUrl(videoId);

  return {
    id: cleanString(payload.episode_id || payload.id) || createEpisodeId(),
    title: cleanString(payload.title),
    speaker: cleanString(payload.speaker),
    series: cleanString(payload.series),
    date: cleanString(payload.date),
    description: cleanString(payload.description),
    audio_url: cleanString(payload.audio_url),
    thumbnailUrl,
    youtube_url: cleanString(payload.youtube_url),
    start_time: cleanString(payload.start_time),
    end_time: cleanString(payload.end_time),
    scripture_reference: cleanString(payload.scripture_reference),
    episode_number: cleanNullableInteger(payload.episode_number),
    show_notes: cleanString(payload.show_notes),
    transcript: cleanString(payload.transcript),
    duration_seconds: cleanNullableInteger(payload.duration_seconds),
    status: existingStatus || 'draft',
    publishedAt: cleanString(payload.publishedAt),
    video_id: videoId,
  };
}

async function fetchContentRows(client) {
  const { data, error } = await client
    .from(CONTENT_TABLE)
    .select('*')
    .in('status', ['draft', 'published']);

  if (error) {
    throw error;
  }

  return (data || []).reduce((accumulator, row) => {
    accumulator[row.status] = row;
    return accumulator;
  }, {});
}

async function initializeSiteContent(client) {
  const existing = await fetchContentRows(client);
  const rows = [];

  if (!existing.draft) {
    rows.push({
      status: 'draft',
      version: existing.published?.version || 1,
      content: clone(defaultSiteContent),
    });
  }

  if (!existing.published) {
    rows.push({
      status: 'published',
      version: existing.draft?.version || 1,
      content: clone(defaultSiteContent),
      published_at: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error } = await client.from(CONTENT_TABLE).insert(rows);

    if (error) {
      throw error;
    }
  }

  return fetchContentRows(client);
}

export async function fetchDraftRow(client) {
  let rows = await fetchContentRows(client);

  if (!rows.draft || !rows.published) {
    rows = await initializeSiteContent(client);
  }

  return rows.draft;
}

export async function saveDraftContentWithClient(client, content) {
  const parsedContent = parseSiteContent(content);
  const draftRow = await fetchDraftRow(client);

  const { data, error } = await client
    .from(CONTENT_TABLE)
    .update({
      content: parsedContent,
    })
    .eq('id', draftRow.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return {
    row: data,
    content: parsedContent,
  };
}

export function findAudioEpisode(content, episodeId) {
  return (content?.sermons?.audioSermons || []).find((episode) => episode.id === episodeId) || null;
}

export async function upsertDraftEpisode(client, episodeInput, { clearAudio = false } = {}) {
  const normalizedEpisode = normalizeEpisodeInput(episodeInput);
  const draftRow = await fetchDraftRow(client);
  const content = parseSiteContent(draftRow.content || defaultSiteContent);
  const currentEpisodes = [...(content.sermons.audioSermons || [])];
  const existingEpisode = currentEpisodes.find((episode) => episode.id === normalizedEpisode.id) || null;

  const nextEpisode = {
    ...(existingEpisode || {}),
    ...normalizedEpisode,
    thumbnailUrl: normalizedEpisode.thumbnailUrl || existingEpisode?.thumbnailUrl || '',
    audio_url: clearAudio ? '' : normalizedEpisode.audio_url,
    duration_seconds: clearAudio ? null : normalizedEpisode.duration_seconds,
    status: normalizedEpisode.status || existingEpisode?.status || 'draft',
    publishedAt: normalizedEpisode.publishedAt || existingEpisode?.publishedAt || '',
  };

  if (existingEpisode) {
    const index = currentEpisodes.findIndex((episode) => episode.id === normalizedEpisode.id);
    currentEpisodes[index] = nextEpisode;
  } else {
    currentEpisodes.unshift(nextEpisode);
  }

  currentEpisodes.sort(sortEpisodesByDateDesc);
  const nextContent = {
    ...content,
    sermons: {
      ...content.sermons,
      audioSermons: currentEpisodes,
    },
  };
  const saved = await saveDraftContentWithClient(client, nextContent);

  return {
    content: saved.content,
    episode: findAudioEpisode(saved.content, normalizedEpisode.id),
    draftRow: saved.row,
  };
}

export async function updateDraftEpisodeById(client, episodeId, updater) {
  const draftRow = await fetchDraftRow(client);
  const content = parseSiteContent(draftRow.content || defaultSiteContent);
  const currentEpisodes = [...(content.sermons.audioSermons || [])];
  const index = currentEpisodes.findIndex((episode) => episode.id === episodeId);

  if (index === -1) {
    throw new Error(`Audio episode not found for id ${episodeId}.`);
  }

  const nextEpisode = updater(clone(currentEpisodes[index]));
  currentEpisodes[index] = nextEpisode;
  currentEpisodes.sort(sortEpisodesByDateDesc);

  const nextContent = {
    ...content,
    sermons: {
      ...content.sermons,
      audioSermons: currentEpisodes,
    },
  };
  const saved = await saveDraftContentWithClient(client, nextContent);

  return {
    content: saved.content,
    episode: findAudioEpisode(saved.content, episodeId),
    draftRow: saved.row,
  };
}

export async function upsertExtractionJob(client, jobInput) {
  const payload = {
    episode_id: cleanString(jobInput.episode_id),
    youtube_url: cleanString(jobInput.youtube_url),
    video_id: cleanString(jobInput.video_id),
    start_time: cleanString(jobInput.start_time),
    end_time: cleanString(jobInput.end_time),
    status: cleanString(jobInput.status) || 'queued',
    requested_by: cleanString(jobInput.requested_by),
    github_run_id: cleanString(jobInput.github_run_id),
    audio_url: cleanString(jobInput.audio_url),
    error_message: cleanString(jobInput.error_message),
    processed_at: jobInput.processed_at || null,
  };

  const { data, error } = await client
    .from(JOB_TABLE)
    .upsert(payload, { onConflict: 'episode_id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateExtractionJob(client, jobId, patch) {
  const { data, error } = await client
    .from(JOB_TABLE)
    .update(patch)
    .eq('id', jobId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchExtractionJob(client, { jobId, episodeId } = {}) {
  let query = client.from(JOB_TABLE).select('*');

  if (jobId) {
    query = query.eq('id', jobId);
  }

  if (episodeId) {
    query = query.eq('episode_id', episodeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function listExtractionJobs(client, { episodeId, episodeIds, statuses } = {}) {
  let query = client
    .from(JOB_TABLE)
    .select('*')
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (episodeId) {
    query = query.eq('episode_id', episodeId);
  }

  if (episodeIds?.length) {
    query = query.in('episode_id', episodeIds);
  }

  if (statuses?.length) {
    query = query.in('status', statuses);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function attachEpisodesToJobs(client, jobs) {
  const draftRow = await fetchDraftRow(client);
  const content = parseSiteContent(draftRow.content || defaultSiteContent);
  const episodesById = new Map((content.sermons.audioSermons || []).map((episode) => [episode.id, episode]));

  return (jobs || []).map((job) => ({
    ...job,
    episode: episodesById.get(job.episode_id) || null,
  }));
}

export async function dispatchGitHubWorkflow({ jobId }) {
  const triggerToken = getRequiredEnv('GITHUB_ACTIONS_TRIGGER_TOKEN', 'GITHUB_TOKEN');
  const repositoryFullName = getRequiredEnv('GITHUB_REPOSITORY_FULL_NAME');
  const workflowFile = getEnv('GITHUB_WORKFLOW_FILE') || 'sermon-audio-extraction.yml';
  const workflowRef = getEnv('GITHUB_WORKFLOW_REF') || 'main';
  const response = await fetch(`https://api.github.com/repos/${repositoryFullName}/actions/workflows/${workflowFile}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${triggerToken}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      ref: workflowRef,
      inputs: {
        job_id: jobId,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to trigger GitHub Actions workflow.');
  }
}

export function getStoragePublicUrl(client, filePath) {
  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadBufferToStorage(client, { filePath, buffer, contentType }) {
  const { error } = await client.storage.from(MEDIA_BUCKET).upload(filePath, buffer, {
    contentType,
    upsert: true,
    cacheControl: '3600',
  });

  if (error) {
    throw error;
  }

  return {
    path: filePath,
    url: getStoragePublicUrl(client, filePath),
  };
}
