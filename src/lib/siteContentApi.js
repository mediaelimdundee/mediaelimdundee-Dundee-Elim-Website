import { defaultSiteContent } from '@/content/defaultSiteContent';
import { parseSiteContent, safeParseSiteContent } from '@/content/siteContentSchema';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabaseClient';

const CONTENT_TABLE = 'site_content_versions';
const CONTACT_TABLE = 'contact_submissions';
const PRAYER_TABLE = 'prayer_submissions';
const MEDIA_BUCKET = 'site-media';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSetupError() {
  return new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

function asContentRowMap(rows) {
  return rows.reduce((accumulator, row) => {
    accumulator[row.status] = row;
    return accumulator;
  }, {});
}

async function fetchContentRows() {
  const client = requireSupabase();
  const { data, error } = await client
    .from(CONTENT_TABLE)
    .select('*')
    .in('status', ['draft', 'published']);

  if (error) {
    throw error;
  }

  return asContentRowMap(data || []);
}

async function initializeSiteContent() {
  const client = requireSupabase();
  const existing = await fetchContentRows();
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

  return fetchContentRows();
}

function normalizeContentResult(row, source = 'supabase') {
  const parsed = safeParseSiteContent(row?.content);

  if (!parsed.success) {
    return {
      content: clone(defaultSiteContent),
      metadata: null,
      source: 'fallback',
      error: 'Stored site content is invalid. The bundled fallback content is being used.',
    };
  }

  return {
    content: parsed.data,
    metadata: row
      ? {
          id: row.id,
          version: row.version || 1,
          updatedAt: row.updated_at || null,
          publishedAt: row.published_at || null,
          status: row.status,
        }
      : null,
    source,
    error: null,
  };
}

export async function fetchPublishedContent() {
  if (!isSupabaseConfigured) {
    return {
      content: clone(defaultSiteContent),
      metadata: null,
      source: 'fallback',
      error: 'Supabase is not configured. The bundled fallback content is being used.',
    };
  }

  try {
    const rows = await fetchContentRows();
    return normalizeContentResult(rows.published);
  } catch (error) {
    return {
      content: clone(defaultSiteContent),
      metadata: null,
      source: 'fallback',
      error: error.message || 'Unable to fetch published content from Supabase.',
    };
  }
}

export async function fetchDraftContent() {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  let rows = await fetchContentRows();

  if (!rows.draft || !rows.published) {
    rows = await initializeSiteContent();
  }

  const result = normalizeContentResult(rows.draft);
  result.publishedMetadata = rows.published
    ? {
        id: rows.published.id,
        version: rows.published.version || 1,
        updatedAt: rows.published.updated_at || null,
        publishedAt: rows.published.published_at || null,
        status: rows.published.status,
      }
    : null;

  return result;
}

export async function saveDraftContent(content) {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  const parsedContent = parseSiteContent(content);
  let rows = await fetchContentRows();

  if (!rows.draft || !rows.published) {
    rows = await initializeSiteContent();
  }

  const { data, error } = await client
    .from(CONTENT_TABLE)
    .update({
      content: parsedContent,
    })
    .eq('id', rows.draft.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return {
    content: parsedContent,
    draftMetadata: {
      id: data.id,
      version: data.version || rows.draft.version || 1,
      updatedAt: data.updated_at || null,
      publishedAt: data.published_at || null,
      status: data.status,
    },
    publishedMetadata: rows.published
      ? {
          id: rows.published.id,
          version: rows.published.version || 1,
          updatedAt: rows.published.updated_at || null,
          publishedAt: rows.published.published_at || null,
          status: rows.published.status,
        }
      : null,
  };
}

export async function publishDraftContent() {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  let rows = await fetchContentRows();

  if (!rows.draft || !rows.published) {
    rows = await initializeSiteContent();
  }

  const version = Math.max(rows.draft?.version || 0, rows.published?.version || 0) + 1;
  const publishedAt = new Date().toISOString();
  const content = parseSiteContent(rows.draft.content);

  const { data: publishedRow, error: publishedError } = await client
    .from(CONTENT_TABLE)
    .update({
      content,
      version,
      published_at: publishedAt,
    })
    .eq('id', rows.published.id)
    .select('*')
    .single();

  if (publishedError) {
    throw publishedError;
  }

  const { data: draftRow, error: draftError } = await client
    .from(CONTENT_TABLE)
    .update({
      content,
      version,
    })
    .eq('id', rows.draft.id)
    .select('*')
    .single();

  if (draftError) {
    throw draftError;
  }

  return {
    content,
    draftMetadata: {
      id: draftRow.id,
      version: draftRow.version || version,
      updatedAt: draftRow.updated_at || null,
      publishedAt: draftRow.published_at || null,
      status: draftRow.status,
    },
    publishedMetadata: {
      id: publishedRow.id,
      version: publishedRow.version || version,
      updatedAt: publishedRow.updated_at || null,
      publishedAt: publishedRow.published_at || publishedAt,
      status: publishedRow.status,
    },
  };
}

export async function uploadMedia(file) {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeBaseName = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'upload';
  const filePath = `uploads/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeBaseName}.${extension}`;

  const { error } = await client.storage.from(MEDIA_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);

  return {
    path: filePath,
    url: data.publicUrl,
    alt: file.name.replace(/\.[^.]+$/, ''),
  };
}

export async function createContactSubmission(payload) {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  const { error } = await client.from(CONTACT_TABLE).insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone || '',
    subject: payload.subject || '',
    message: payload.message,
  });

  if (error) {
    throw error;
  }
}

export async function createPrayerSubmission(payload) {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  const { error } = await client.from(PRAYER_TABLE).insert({
    name: payload.name,
    email: payload.email || '',
    request: payload.request,
    is_private: Boolean(payload.is_private),
  });

  if (error) {
    throw error;
  }
}

function normalizeSubmission(type, row) {
  return {
    id: row.id,
    type,
    name: row.name,
    email: row.email || '',
    phone: type === 'contact' ? row.phone || '' : '',
    subject: type === 'contact' ? row.subject || '' : '',
    message: type === 'contact' ? row.message || '' : row.request || '',
    isPrivate: type === 'prayer' ? Boolean(row.is_private) : false,
    status: row.status || 'new',
    createdAt: row.created_at || null,
  };
}

export async function listSubmissions({ type = 'all', status = 'all' } = {}) {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  const contactQuery = client.from(CONTACT_TABLE).select('*').order('created_at', { ascending: false });
  const prayerQuery = client.from(PRAYER_TABLE).select('*').order('created_at', { ascending: false });

  if (status !== 'all') {
    contactQuery.eq('status', status);
    prayerQuery.eq('status', status);
  }

  const [contactResult, prayerResult] = await Promise.all([
    type === 'prayer' ? Promise.resolve({ data: [], error: null }) : contactQuery,
    type === 'contact' ? Promise.resolve({ data: [], error: null }) : prayerQuery,
  ]);

  if (contactResult.error) {
    throw contactResult.error;
  }

  if (prayerResult.error) {
    throw prayerResult.error;
  }

  return [
    ...(contactResult.data || []).map((row) => normalizeSubmission('contact', row)),
    ...(prayerResult.data || []).map((row) => normalizeSubmission('prayer', row)),
  ].sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

export async function updateSubmissionStatus(type, id, status) {
  if (!isSupabaseConfigured) {
    throw getSetupError();
  }

  const client = requireSupabase();
  const table = type === 'prayer' ? PRAYER_TABLE : CONTACT_TABLE;
  const { error } = await client.from(table).update({ status }).eq('id', id);

  if (error) {
    throw error;
  }
}
