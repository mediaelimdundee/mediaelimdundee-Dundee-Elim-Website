export function resolveMediaSrc(asset) {
  return asset?.url || asset?.path || '';
}

export function formatPhoneHref(phoneValue) {
  return String(phoneValue || '').replace(/[^\d+]/g, '');
}

export function isPublishedContentItem(item) {
  return !item?.status || item.status === 'published';
}

export function filterPublishedItems(items) {
  return (items || []).filter(isPublishedContentItem);
}
