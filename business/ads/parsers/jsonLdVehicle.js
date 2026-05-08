const cheerio = require('cheerio');

const PARSER_VERSION = 'jsonld-vehicle-v1';

function asArray(x) {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

function collectTypes(node) {
  const t = node['@type'];
  return asArray(t).map((x) => (typeof x === 'string' ? x : ''));
}

function flattenJsonLdNodes(data) {
  const out = [];
  const visit = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(visit);
      return;
    }
    out.push(obj);
    if (obj['@graph']) visit(obj['@graph']);
  };
  visit(data);
  return out;
}

function pickYear(vehicle) {
  const md = vehicle.modelDate || vehicle.vehicleModelDate;
  if (typeof md === 'string' && /^\d{4}/.test(md)) {
    return parseInt(md.slice(0, 4), 10);
  }
  const pr = vehicle.productionDate;
  if (typeof pr === 'string' && /^\d{4}/.test(pr)) {
    return parseInt(pr.slice(0, 4), 10);
  }
  return null;
}

function pickMileage(vehicle) {
  const m = vehicle.mileageFromOdometer;
  if (!m) return null;
  if (typeof m === 'object' && m.value != null) {
    const n = Number(m.value);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (typeof m === 'string' || typeof m === 'number') {
    const n = Number(String(m).replace(/\D/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** schema.org uses `brand` for manufacturer name — we map it to our `brand` field. */
function pickBrandModel(vehicle) {
  let brand;
  let model;

  const brandNode = vehicle.brand;
  if (typeof brandNode === 'string') {
    brand = brandNode;
  } else if (brandNode && typeof brandNode === 'object') {
    brand = brandNode.name || null;
  }

  if (typeof vehicle.model === 'string') {
    model = vehicle.model;
  } else if (vehicle.model && typeof vehicle.model === 'object') {
    model = vehicle.model.name || null;
  }

  return { brand: brand || null, model: model || null };
}

function pickOffer(vehicle) {
  const offers = vehicle.offers;
  const o = Array.isArray(offers) ? offers[0] : offers;
  if (!o || typeof o !== 'object') {
    return { price: null, currency: null };
  }
  const price = o.price != null ? Number(o.price) : null;
  const currency = o.priceCurrency || null;
  return {
    price: Number.isFinite(price) ? price : null,
    currency: typeof currency === 'string' ? currency : null,
  };
}

function pickVin(vehicle) {
  const v = vehicle.vehicleIdentificationNumber;
  return typeof v === 'string' ? v : null;
}

function pickFuel(vehicle) {
  const e = vehicle.vehicleEngine;
  if (e && typeof e === 'object' && e.fuelType) {
    return typeof e.fuelType === 'string' ? e.fuelType : null;
  }
  return null;
}

function pickTransmission(vehicle) {
  const t = vehicle.vehicleTransmission;
  return typeof t === 'string' ? t : null;
}

function pickBody(vehicle) {
  const b = vehicle.bodyType;
  return typeof b === 'string' ? b : null;
}

/**
 * Parse schema.org Vehicle from HTML (application/ld+json blocks).
 * @param {string} html
 * @param {string} pageUrl
 * @returns {{ data: object, rawPayload: object } | null}
 */
function parseJsonLdVehicle(html, pageUrl) {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => $(el).html())
    .filter(Boolean);

  for (const raw of scripts) {
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }

    const nodes = flattenJsonLdNodes(json);
    for (const node of nodes) {
      const types = collectTypes(node);
      const isVehicle =
        types.includes('Vehicle') ||
        types.includes('Car') ||
        types.includes('MotorizedRoadVehicle');

      if (!isVehicle) continue;

      const { brand, model } = pickBrandModel(node);
      const year = pickYear(node);
      const mileage = pickMileage(node);
      const { price, currency } = pickOffer(node);

      const data = {
        brand,
        model,
        year,
        mileage,
        price,
        currency,
        fuel: pickFuel(node),
        transmission: pickTransmission(node),
        bodyType: pickBody(node),
        vin: pickVin(node),
        site: (() => {
          try {
            return new URL(pageUrl).hostname;
          } catch {
            return null;
          }
        })(),
        parserVersion: PARSER_VERSION,
      };

      return {
        data,
        rawPayload: { vehicle: node, pageUrl },
      };
    }
  }

  return null;
}

module.exports = {
  parseJsonLdVehicle,
  PARSER_VERSION,
};
