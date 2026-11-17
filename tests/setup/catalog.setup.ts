import { test as setup } from '@playwright/test';
import { TestHooksApi } from '../../src/api/test-hooks.api';

setup('prepare catalog data', async ({ request }) => {
  const testHooksApi = new TestHooksApi(request);
  await testHooksApi.seedBaseline();
});
