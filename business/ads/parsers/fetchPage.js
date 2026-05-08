const MAX_BYTES = Number(process.env.MAX_FETCH_BYTES || 2_500_000);

/**
 * @param {string} url
 * @param {object} [options]
 * @param {string} [options.correlationId]
 * @returns {Promise<{ html: string, finalUrl: string }>}
 */
async function fetchPage(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.FETCH_TIMEOUT_MS || 15_000);
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        ...(options.correlationId
          ? { 'X-Request-Id': options.correlationId }
          : {}),
      },
    });

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.statusCode = res.status >= 500 ? 503 : res.status === 404 ? 404 : 502;
      throw err;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      const err = new Error('Unexpected content type');
      err.statusCode = 422;
      throw err;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) {
        const err = new Error('Response too large');
        err.statusCode = 422;
        throw err;
      }
      return { html: text, finalUrl: res.url || url };
    }

    const chunks = [];
    let total = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_BYTES) {
        const err = new Error('Response too large');
        err.statusCode = 422;
        throw err;
      }
      chunks.push(value);
    }

    const html = Buffer.concat(chunks).toString('utf8');
    return { html, finalUrl: res.url || url };
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Fetch timeout');
      err.statusCode = 503;
      throw err;
    }
    if (e.statusCode) throw e;
    const err = new Error(e.message || 'Fetch failed');
    err.statusCode = 503;
    throw err;
  } finally {
    clearTimeout(t);
  }
}

module.exports = { fetchPage, MAX_BYTES };
