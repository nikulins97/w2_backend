import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEnv } from '../config/env.js';

test('loadEnv reads required tgbot configuration', () => {
  const previous = { ...process.env };

  try {
    process.env.BOT_TOKEN = 'bot-token';
    process.env.API_BASE_URL = 'http://api:3000';
    process.env.BUSINESS_BASE_URL = 'http://business:4000';
    process.env.HEALTH_PORT = '4100';

    const env = loadEnv();

    assert.equal(env.botToken, 'bot-token');
    assert.equal(env.apiBaseUrl, 'http://api:3000');
    assert.equal(env.businessBaseUrl, 'http://business:4000');
    assert.equal(env.healthPort, 4100);
  } finally {
    process.env = previous;
  }
});
