import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClient } from '../clients/apiClient.js';
import { HttpError } from '../clients/http.js';

test('ApiClient.getStatus returns API status', async () => {
  const client = new ApiClient('http://api.test', async (url, init) => {
    assert.equal(url, 'http://api.test/status');
    assert.equal(init?.method, 'GET');

    return new Response(
      JSON.stringify({
        Status: 'Running',
      }),
      { status: 200 }
    );
  });

  const result = await client.getStatus();

  assert.equal(result, 'Running');
});

test('ApiClient.getStatus throws HttpError on API failure', async () => {
  const client = new ApiClient('http://api.test', async () => {
    return new Response(JSON.stringify({ error: 'Unavailable' }), {
      status: 503,
    });
  });

  await assert.rejects(() => client.getStatus(), HttpError);
});
