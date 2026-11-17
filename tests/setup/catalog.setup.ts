import { test as setup } from '@playwright/test';
import { RaceHubApi } from '../../src/api/racehub-test.api';

setup('prepare catalog data', async ({ request }) => {
  const raceApi = new RaceHubApi(request);
  await raceApi.seedBaseLine();
});
