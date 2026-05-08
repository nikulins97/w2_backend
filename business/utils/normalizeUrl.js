const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_eid',
  '_ga',
  'yclid',
]);

/**
 * Normalize ad URL for stable deduplication (idempotent POST).
 * @param {string} input
 * @returns {string}
 */
function normalizeUrl(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    throw new Error('URL is empty');
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are supported');
  }

  url.hostname = url.hostname.toLowerCase();
  url.hash = '';

  const params = url.searchParams;
  for (const key of [...params.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith('utm_') || TRACKING_PARAMS.has(lower)) {
      params.delete(key);
    }
  }
  url.search = params.toString() ? `?${params.toString()}` : '';

  let out = url.toString();
  if (out.endsWith('/') && url.pathname !== '/') {
    out = out.slice(0, -1);
  }

  return out;
}

module.exports = { normalizeUrl };
