import assert from 'node:assert/strict';
import test from 'node:test';
import { BusinessClient } from '../clients/businessClient.js';

test('BusinessClient.getStatus returns business service status', async () => {
  const client = new BusinessClient('http://business.test', async (url, init) => {
    assert.equal(url, 'http://business.test/status');
    assert.equal(init?.method, 'GET');

    return new Response(
      JSON.stringify({
        status: 'Running',
        service: 'business',
      }),
      { status: 200 }
    );
  });

  const status = await client.getStatus();

  assert.equal(status, 'Running (business)');
});
