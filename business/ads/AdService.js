const logger = require('../utils/logger');
const { normalizeUrl } = require('../utils/normalizeUrl');
const { parseAdFromUrl } = require('./parsers/parseAd');

function serializeAd(row) {
  if (!row) return null;
  const { rawPayload, ...rest } = row;
  let raw = rawPayload;
  if (process.env.EXPOSE_RAW_AD === '1' && typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      /* keep string */
    }
  }
  return {
    ...rest,
    ...(process.env.EXPOSE_RAW_AD === '1' ? { rawPayload: raw } : {}),
  };
}

class AdService {
  constructor(adRepository) {
    this.repo = adRepository;
  }

  /**
   * @param {{ url: string, userId?: number, refresh?: boolean, correlationId?: string }} input
   */
  async createOrGet(input) {
    const normalized = normalizeUrl(input.url);
    const userId =
      input.userId != null && Number.isFinite(Number(input.userId))
        ? Number(input.userId)
        : null;

    const existing = await this.repo.findByUrl(normalized);

    if (existing && !input.refresh) {
      return serializeAd(existing);
    }

    let parsed;
    try {
      parsed = await parseAdFromUrl(normalized, {
        correlationId: input.correlationId,
      });
    } catch (e) {
      logger.warn('Parse failed', {
        correlationId: input.correlationId,
        url: normalized,
        error: e.message,
      });
      throw e;
    }

    const { data, rawPayload } = parsed;
    const now = new Date();

    const serializedPayload = rawPayload != null ? JSON.stringify(rawPayload) : undefined;

    const saved = await this.repo.upsert(
      normalized,
      {
        sourceUrl: normalized,
        createdByUserId: userId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        price: data.price,
        currency: data.currency,
        fuel: data.fuel,
        transmission: data.transmission,
        bodyType: data.bodyType,
        vin: data.vin,
        site: data.site,
        parserVersion: data.parserVersion,
        rawPayload: serializedPayload,
        parsedAt: now,
      },
      {
        ...(userId != null ? { createdByUserId: userId } : {}),
        brand: data.brand,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        price: data.price,
        currency: data.currency,
        fuel: data.fuel,
        transmission: data.transmission,
        bodyType: data.bodyType,
        vin: data.vin,
        site: data.site,
        parserVersion: data.parserVersion,
        rawPayload: serializedPayload,
        parsedAt: now,
      }
    );

    return serializeAd(saved);
  }

  /**
   * @param {string} id
   * @param {{ userId: number, refresh?: boolean, correlationId?: string }} opts
   */
  async getById(id, opts) {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }

    if (!opts.refresh) {
      return serializeAd(row);
    }

    return this.createOrGet({
      url: row.sourceUrl,
      userId: opts.userId,
      refresh: true,
      correlationId: opts.correlationId,
    });
  }
}

module.exports = AdService;
