import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildYoutubeThumbnailUrl, validateTimecodeRange } from '../../src/lib/sermonExtraction.js';
import {
  createServerClient,
  dispatchGitHubWorkflow,
  extractBearerToken,
  hasGitHubWorkflowCredentials,
  normalizeEpisodeInput,
  upsertDraftEpisode,
  upsertExtractionJob,
  updateExtractionJob,
  verifyAdminBearerToken,
} from '../../shared/sermonExtractionServer.mjs';

const WORKER_SCRIPT_PATH = fileURLToPath(new URL('../../scripts/sermon-extraction-worker.mjs', import.meta.url));

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

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    throw new Error('Invalid JSON body.');
  }
}

function shouldUseLocalWorker() {
  return process.env.SERMON_EXTRACTION_RUNNER === 'local'
    || (!hasGitHubWorkflowCredentials() && process.env.NODE_ENV !== 'production');
}

function spawnLocalWorker({ jobId, accessToken }) {
  if (!accessToken) {
    throw new Error('Missing access token for local sermon extraction worker.');
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [WORKER_SCRIPT_PATH, '--job-id', jobId], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SERMON_EXTRACTION_ACCESS_TOKEN: accessToken,
        SERMON_EXTRACTION_RUNNER: 'local',
      },
      detached: process.platform !== 'win32',
      stdio: 'ignore',
    });

    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  try {
    const accessToken = extractBearerToken(event.headers);
    const user = await verifyAdminBearerToken(accessToken);
    const payload = parseBody(event);
    const range = validateTimecodeRange(payload.start_time, payload.end_time);

    if (!payload.youtube_url?.trim()) {
      return json(400, { error: 'A YouTube URL is required.' });
    }

    if (!payload.title?.trim()) {
      return json(400, { error: 'An episode title is required before extraction.' });
    }

    if (!payload.date?.trim()) {
      return json(400, { error: 'An episode date is required before extraction.' });
    }

    if (!range.valid) {
      return json(400, { error: range.error });
    }

    const client = createServerClient({ accessToken });
    const normalizedEpisode = normalizeEpisodeInput({
      ...payload,
      start_time: range.normalizedStartTime,
      end_time: range.normalizedEndTime,
      audio_url: '',
      duration_seconds: null,
      thumbnailUrl: payload.thumbnailUrl || buildYoutubeThumbnailUrl(payload.video_id),
    });
    const saved = await upsertDraftEpisode(client, normalizedEpisode, { clearAudio: true });
    let job = await upsertExtractionJob(client, {
      episode_id: saved.episode.id,
      youtube_url: normalizedEpisode.youtube_url,
      video_id: normalizedEpisode.video_id,
      start_time: range.normalizedStartTime,
      end_time: range.normalizedEndTime,
      status: 'queued',
      requested_by: user.email || user.id,
      github_run_id: '',
      audio_url: '',
      error_message: '',
      processed_at: null,
    });

    try {
      if (hasGitHubWorkflowCredentials()) {
        await dispatchGitHubWorkflow({ jobId: job.id });
      } else if (shouldUseLocalWorker()) {
        await spawnLocalWorker({ jobId: job.id, accessToken });
      } else {
        throw new Error('Sermon extraction worker is not configured. Set GitHub workflow credentials or enable the local runner.');
      }
    } catch (workflowError) {
      job = await updateExtractionJob(client, job.id, {
        status: 'failed',
        error_message: workflowError.message || 'Unable to trigger GitHub Actions workflow.',
      });
      throw workflowError;
    }

    return json(200, {
      job,
      episode: saved.episode,
      audioSermons: saved.content.sermons.audioSermons,
    });
  } catch (error) {
    return json(500, { error: error.message || 'Unexpected sermon extraction error.' });
  }
}
