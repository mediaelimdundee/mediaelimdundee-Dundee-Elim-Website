import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import YTDlpWrapModule from 'yt-dlp-wrap';
import {
  buildYoutubeThumbnailUrl,
  buildYoutubeWatchUrl,
  validateTimecodeRange,
} from '../src/lib/sermonExtraction.js';
import {
  createServerClient,
  fetchExtractionJob,
  listExtractionJobs,
  updateDraftEpisodeById,
  updateExtractionJob,
  uploadBufferToStorage,
} from '../shared/sermonExtractionServer.mjs';

const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID || '';
const LOCAL_ACCESS_TOKEN = process.env.SERMON_EXTRACTION_ACCESS_TOKEN || '';
const YT_DLP_CACHE_DIR = path.join(os.tmpdir(), 'dundee-elim-sermon-extraction');
const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;

let resolvedYtDlpBinaryPromise;

function parseArgs(argv) {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (!item.startsWith('--')) {
      continue;
    }

    const key = item.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args.set(key, true);
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  return args;
}

function isActiveLiveMetadata(metadata) {
  return Boolean(
    metadata?.is_live
    || ['is_live', 'is_upcoming', 'post_live'].includes(metadata?.live_status),
  );
}

function isLikelyArchivePending({ url, metadata, errorText }) {
  if (isActiveLiveMetadata(metadata)) {
    return true;
  }

  const lower = String(errorText || '').toLowerCase();
  const pendingPhrases = [
    'live event will begin',
    'live stream recording is not available',
    'is not currently live',
    'this live event has ended',
    'video is not yet available',
    'will begin in',
    'post-live',
    'still being processed',
  ];

  if (pendingPhrases.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  return Boolean(
    metadata?.was_live
    && (String(url || '').includes('/live') || lower.includes('live')),
  );
}

function runCommand(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `${command} exited with code ${code}.`));
    });
  });
}

async function commandExists(command) {
  try {
    await runCommand(command, ['--version']);
    return true;
  } catch {
    return false;
  }
}

async function resolveYtDlpBinary() {
  if (process.env.YT_DLP_BIN) {
    return process.env.YT_DLP_BIN;
  }

  if (await commandExists('yt-dlp')) {
    return 'yt-dlp';
  }

  if (!resolvedYtDlpBinaryPromise) {
    resolvedYtDlpBinaryPromise = (async () => {
      const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
      const binaryPath = path.join(YT_DLP_CACHE_DIR, binaryName);

      await fs.mkdir(YT_DLP_CACHE_DIR, { recursive: true });

      try {
        await fs.access(binaryPath);
      } catch {
        await YTDlpWrap.downloadFromGithub(binaryPath);
        await fs.chmod(binaryPath, 0o755).catch(() => {});
      }

      return binaryPath;
    })();
  }

  return resolvedYtDlpBinaryPromise;
}

async function createYtDlp() {
  return new YTDlpWrap(await resolveYtDlpBinary());
}

async function loadYoutubeMetadata(url) {
  const ytDlp = await createYtDlp();
  const stdout = await ytDlp.execPromise([
    '--dump-single-json',
    '--skip-download',
    '--no-warnings',
    '--no-playlist',
    url,
  ]);

  return JSON.parse(stdout);
}

async function downloadAudioSource(url, tempDir) {
  const ytDlp = await createYtDlp();

  await ytDlp.execPromise([
    '--no-playlist',
    '--no-warnings',
    '-f',
    'bestaudio',
    '--output',
    'source.%(ext)s',
    url,
  ], { cwd: tempDir });

  const files = await fs.readdir(tempDir);
  const sourceFile = files.find((file) => file.startsWith('source.'));

  if (!sourceFile) {
    throw new Error('yt-dlp completed without producing a source file.');
  }

  return path.join(tempDir, sourceFile);
}

async function trimAndConvertToMp3(sourceFile, outputFile, startTime, endTime) {
  const ffmpegBinary = ffmpegStatic || 'ffmpeg';

  await runCommand(ffmpegBinary, [
    '-y',
    '-ss',
    startTime,
    '-to',
    endTime,
    '-i',
    sourceFile,
    '-vn',
    '-acodec',
    'libmp3lame',
    '-ar',
    '44100',
    '-b:a',
    '128k',
    outputFile,
  ]);
}

async function markWaiting(client, job, patch = {}) {
  return updateExtractionJob(client, job.id, {
    ...patch,
    status: 'waiting_for_archive',
    github_run_id: GITHUB_RUN_ID,
    error_message: '',
  });
}

async function markFailed(client, job, errorMessage, patch = {}) {
  return updateExtractionJob(client, job.id, {
    ...patch,
    status: 'failed',
    github_run_id: GITHUB_RUN_ID,
    error_message: String(errorMessage || 'Unknown extraction failure.').slice(0, 5000),
  });
}

async function processJob(client, job) {
  const range = validateTimecodeRange(job.start_time, job.end_time);

  if (!range.valid) {
    await markFailed(client, job, range.error);
    return;
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sermon-extract-'));

  try {
    let activeJob = await updateExtractionJob(client, job.id, {
      status: 'processing',
      github_run_id: GITHUB_RUN_ID,
      error_message: '',
      video_id: job.video_id || '',
    });

    const initialUrl = activeJob.video_id ? buildYoutubeWatchUrl(activeJob.video_id) : activeJob.youtube_url;
    let metadata;

    try {
      metadata = await loadYoutubeMetadata(initialUrl);
    } catch (metadataError) {
      if (isLikelyArchivePending({ url: initialUrl, errorText: metadataError.message })) {
        await markWaiting(client, activeJob);
        return;
      }

      await markFailed(client, activeJob, metadataError.message);
      return;
    }

    if (isActiveLiveMetadata(metadata)) {
      await markWaiting(client, activeJob, {
        video_id: metadata.id || activeJob.video_id || '',
      });
      return;
    }

    const resolvedVideoId = metadata.id || activeJob.video_id || '';
    const resolvedUrl = metadata.webpage_url || buildYoutubeWatchUrl(resolvedVideoId) || initialUrl;
    const thumbnailUrl = metadata.thumbnail || buildYoutubeThumbnailUrl(resolvedVideoId);

    let sourceFile;

    try {
      sourceFile = await downloadAudioSource(resolvedUrl, tempDir);
    } catch (downloadError) {
      if (isLikelyArchivePending({ url: resolvedUrl, metadata, errorText: downloadError.message })) {
        await markWaiting(client, activeJob, {
          video_id: resolvedVideoId,
        });
        return;
      }

      await markFailed(client, activeJob, downloadError.message, {
        video_id: resolvedVideoId,
      });
      return;
    }

    const outputFile = path.join(tempDir, 'sermon-audio.mp3');
    await trimAndConvertToMp3(sourceFile, outputFile, range.normalizedStartTime, range.normalizedEndTime);

    activeJob = await updateExtractionJob(client, job.id, {
      status: 'uploading',
      github_run_id: GITHUB_RUN_ID,
      video_id: resolvedVideoId,
      error_message: '',
    });

    const buffer = await fs.readFile(outputFile);
    const uploaded = await uploadBufferToStorage(client, {
      filePath: `sermons/audio/${job.episode_id}.mp3`,
      buffer,
      contentType: 'audio/mpeg',
    });

    const updatedEpisode = await updateDraftEpisodeById(client, job.episode_id, (episode) => ({
      ...episode,
      youtube_url: resolvedUrl,
      start_time: range.normalizedStartTime,
      end_time: range.normalizedEndTime,
      audio_url: uploaded.url,
      duration_seconds: range.durationSeconds,
      thumbnailUrl: thumbnailUrl || episode.thumbnailUrl || '',
      status: 'ready',
    }));

    await updateExtractionJob(client, job.id, {
      status: 'ready',
      github_run_id: GITHUB_RUN_ID,
      video_id: resolvedVideoId,
      audio_url: uploaded.url,
      error_message: '',
      processed_at: new Date().toISOString(),
    });

    console.log(`Processed episode ${job.episode_id}: ${updatedEpisode.episode.audio_url}`);
  } catch (error) {
    await markFailed(client, job, error.message);
    throw error;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = createServerClient({
    accessToken: LOCAL_ACCESS_TOKEN,
    preferServiceRole: !LOCAL_ACCESS_TOKEN,
  });
  const explicitJobId = args.get('job-id');

  if (explicitJobId) {
    const job = await fetchExtractionJob(client, { jobId: explicitJobId });

    if (!job) {
      throw new Error(`No sermon extraction job found for id ${explicitJobId}.`);
    }

    await processJob(client, job);
    return;
  }

  const jobs = await listExtractionJobs(client, {
    statuses: ['queued', 'waiting_for_archive'],
  });

  let failureCount = 0;

  for (const job of jobs) {
    try {
      await processJob(client, job);
    } catch (error) {
      failureCount += 1;
      console.error(`Failed processing queued job ${job.id}:`, error);
    }
  }

  if (failureCount > 0) {
    throw new Error(`${failureCount} queued sermon extraction job(s) failed.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
