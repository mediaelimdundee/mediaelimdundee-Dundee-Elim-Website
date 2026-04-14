export const EXTRACTION_JOB_STATUSES = ['queued', 'waiting_for_archive', 'processing', 'uploading', 'ready', 'failed'];

export function parseTimecodeToSeconds(value) {
  const input = String(value || '').trim();

  if (!input) {
    return null;
  }

  const parts = input.split(':').map((segment) => segment.trim());

  if (parts.length < 2 || parts.length > 3) {
    return null;
  }

  if (parts.some((segment) => !/^\d+$/.test(segment))) {
    return null;
  }

  const numbers = parts.map((segment) => Number(segment));
  const [hours, minutes, seconds] = parts.length === 3 ? numbers : [0, numbers[0], numbers[1]];

  if (minutes > 59 || seconds > 59) {
    return null;
  }

  return (hours * 3600) + (minutes * 60) + seconds;
}

export function secondsToTimecode(totalSeconds) {
  const wholeSeconds = Number(totalSeconds);

  if (!Number.isFinite(wholeSeconds) || wholeSeconds < 0) {
    return '';
  }

  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = Math.floor(wholeSeconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function normalizeTimecode(value) {
  const seconds = parseTimecodeToSeconds(value);

  if (seconds === null) {
    return '';
  }

  return secondsToTimecode(seconds);
}

export function validateTimecodeRange(startTime, endTime) {
  const startSeconds = parseTimecodeToSeconds(startTime);
  const endSeconds = parseTimecodeToSeconds(endTime);

  if (startSeconds === null) {
    return { valid: false, error: 'Start time must use MM:SS or HH:MM:SS.' };
  }

  if (endSeconds === null) {
    return { valid: false, error: 'End time must use MM:SS or HH:MM:SS.' };
  }

  if (endSeconds <= startSeconds) {
    return { valid: false, error: 'End time must be later than start time.' };
  }

  return {
    valid: true,
    startSeconds,
    endSeconds,
    normalizedStartTime: secondsToTimecode(startSeconds),
    normalizedEndTime: secondsToTimecode(endSeconds),
    durationSeconds: endSeconds - startSeconds,
  };
}

export function extractYoutubeVideoId(value) {
  const input = String(value || '').trim();

  if (!input) {
    return '';
  }

  const directMatch = input.match(/^[A-Za-z0-9_-]{11}$/);

  if (directMatch) {
    return directMatch[0];
  }

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return '';
}

export function buildYoutubeWatchUrl(videoId) {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
}

export function buildYoutubeThumbnailUrl(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

export function isExtractionActiveStatus(status) {
  return ['queued', 'waiting_for_archive', 'processing', 'uploading'].includes(status);
}

export function getExtractionStatusLabel(status) {
  const labels = {
    queued: 'Queued',
    waiting_for_archive: 'Waiting For Archive',
    processing: 'Processing',
    uploading: 'Uploading',
    ready: 'Ready',
    failed: 'Failed',
  };

  return labels[status] || 'Unknown';
}

export function getExtractionStatusTone(status) {
  const tones = {
    queued: 'border-slate-200 bg-slate-50 text-slate-700',
    waiting_for_archive: 'border-amber-200 bg-amber-50 text-amber-700',
    processing: 'border-blue-200 bg-blue-50 text-blue-700',
    uploading: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    failed: 'border-red-200 bg-red-50 text-red-700',
  };

  return tones[status] || 'border-slate-200 bg-slate-50 text-slate-700';
}

export function selectLatestJob(rows) {
  return [...(rows || [])].sort((left, right) => {
    const leftStamp = left?.updated_at || left?.created_at || '';
    const rightStamp = right?.updated_at || right?.created_at || '';
    return String(rightStamp).localeCompare(String(leftStamp));
  })[0] || null;
}

export function buildLatestJobMap(rows) {
  const latestByEpisode = new Map();

  for (const row of rows || []) {
    if (!row?.episode_id) {
      continue;
    }

    const current = latestByEpisode.get(row.episode_id);
    const currentStamp = current?.updated_at || current?.created_at || '';
    const nextStamp = row.updated_at || row.created_at || '';

    if (!current || String(nextStamp).localeCompare(String(currentStamp)) > 0) {
      latestByEpisode.set(row.episode_id, row);
    }
  }

  return Object.fromEntries(latestByEpisode.entries());
}
