import { test, expect } from '../../src/fixtures/api.fixture';
import type { HealthResponse } from '../../src/api/racehub.api';

test('RaceHub site is up', { tag: ['@api', '@TEST-07'] }, async ({ healthApi }) => {
  const response = await healthApi.getHealth();
  expect(response.status()).toBe(200);
  const body = (await response.json()) as HealthResponse;
  expect(body).toMatchObject({
    status: 'ok',
    version: expect.stringMatching(/^([0-9a-f]{7}|dev)$/),
    env: expect.stringMatching(/^(staging|production|local)$/),
  });
});
