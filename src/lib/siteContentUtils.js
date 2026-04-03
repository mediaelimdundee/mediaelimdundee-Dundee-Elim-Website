export function resolveMediaSrc(asset) {
  return asset?.url || asset?.path || '';
}

export function formatPhoneHref(phoneValue) {
  return String(phoneValue || '').replace(/[^\d+]/g, '');
}
