// @ts-nocheck
import { filterPublishedItems } from '@/lib/siteContentUtils';

export function createAdminId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeStatus(item) {
  return {
    ...item,
    status: item?.status || 'published',
    publishedAt: item?.publishedAt || '',
  };
}

function sortByDateDesc(left, right) {
  return (right.date || '').localeCompare(left.date || '');
}

export function getSermonRecords(content) {
  const videos = (content?.sermons?.videoSermons || []).map((item, index) => ({
    ...normalizeStatus(item),
    type: 'video',
    _key: `video-${item.id || index}`,
  }));
  const audio = (content?.sermons?.audioSermons || []).map((item, index) => ({
    ...normalizeStatus(item),
    type: 'audio',
    _key: `audio-${item.id || index}`,
  }));

  return [...videos, ...audio].sort(sortByDateDesc);
}

export function applySermonRecords(content, records) {
  const nextVideoSermons = records
    .filter((record) => record.type === 'video')
    .map(({ _key, type, ...record }) => ({
      ...record,
      id: record.id || createAdminId('video'),
    }));
  const nextAudioSermons = records
    .filter((record) => record.type === 'audio')
    .map(({ _key, type, ...record }) => ({
      ...record,
      id: record.id || createAdminId('audio'),
    }));

  return {
    ...content,
    sermons: {
      ...content.sermons,
      videoSermons: nextVideoSermons,
      audioSermons: nextAudioSermons,
    },
  };
}

export function getEventRecords(content) {
  const recurring = (content?.events?.recurringTemplates || []).map((item, index) => ({
    ...normalizeStatus(item),
    eventType: 'recurring',
    _key: `recurring-${item.id || index}`,
  }));
  const special = (content?.events?.specialEvents || []).map((item, index) => ({
    ...normalizeStatus(item),
    eventType: 'one_off',
    _key: `special-${item.id || index}`,
  }));

  return [...special, ...recurring].sort(sortByDateDesc);
}

export function applyEventRecords(content, records) {
  const recurringTemplates = records
    .filter((record) => record.eventType === 'recurring')
    .map(({ _key, eventType, ...record }) => ({
      ...record,
      id: record.id || createAdminId('event'),
    }));
  const specialEvents = records
    .filter((record) => record.eventType === 'one_off')
    .map(({ _key, eventType, ...record }) => ({
      ...record,
      id: record.id || createAdminId('event'),
    }));

  return {
    ...content,
    events: {
      ...content.events,
      recurringTemplates,
      specialEvents,
    },
  };
}

export function getMinistryRecords(content) {
  return (content?.ministries?.items || []).map((item, index) => ({
    ...normalizeStatus(item),
    id: item.id || createAdminId('ministry'),
    _key: item.id || `ministry-${index}`,
  }));
}

export function applyMinistryRecords(content, records) {
  return {
    ...content,
    ministries: {
      ...content.ministries,
      items: records.map(({ _key, ...record }) => ({
        ...record,
        id: record.id || createAdminId('ministry'),
      })),
    },
  };
}

export function getDashboardSnapshot(content) {
  const sermons = getSermonRecords(content);
  const events = getEventRecords(content);
  const ministries = getMinistryRecords(content);

  return {
    sermons,
    publishedSermons: filterPublishedItems(sermons).length,
    events,
    ministries,
  };
}
