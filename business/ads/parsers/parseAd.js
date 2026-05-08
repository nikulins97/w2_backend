const { fetchPage } = require('./fetchPage');
const { parseJsonLdVehicle } = require('./jsonLdVehicle');

/**
 * Fetch URL and parse vehicle ad (schema.org Vehicle JSON-LD).
 * @param {string} url normalized http(s) URL
 * @param {{ correlationId?: string }} [options]
 */
async function parseAdFromUrl(url, options = {}) {
  const { html, finalUrl } = await fetchPage(url, {
    correlationId: options.correlationId,
  });

  const parsed = parseJsonLdVehicle(html, finalUrl);
  if (!parsed) {
    const err = new Error(
      'Unsupported page: no schema.org Vehicle JSON-LD found'
    );
    err.statusCode = 422;
    throw err;
  }

  return {
    ...parsed,
    finalUrl,
  };
}

module.exports = { parseAdFromUrl };
