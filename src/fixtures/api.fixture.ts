import { HealthApi } from '../api/racehub.api';
import { test as base } from '@playwright/test';
export const test = base.extend<{ healthApi: HealthApi }>({
  healthApi: async ({ request }, use) => {
    await use(new HealthApi(request));
  },
});
export { expect } from '@playwright/test';
