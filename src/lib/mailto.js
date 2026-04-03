export function buildMailtoUrl({ to, subject, body }) {
  const params = new URLSearchParams();

  if (subject) {
    params.set('subject', subject);
  }

  if (body) {
    params.set('body', body.replace(/\n/g, '\r\n'));
  }

  const query = params.toString();

  return `mailto:${to}${query ? `?${query}` : ''}`;
}

export function openMailto(options) {
  window.location.href = buildMailtoUrl(options);
}
