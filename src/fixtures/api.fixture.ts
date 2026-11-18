import { HealthApi, EventsApi, type EventsResponse } from '../api/racehub.api';
import { expect, test as base } from '@playwright/test';

type ApiFixtures = {
  healthApi: HealthApi;
  eventsApi: EventsApi;
  eventsList: EventsResponse;
};

export const test = base.extend<ApiFixtures>({
  healthApi: async ({ request }, use) => {
    await use(new HealthApi(request));
  },
  eventsApi: async ({ request }, use) => {
    await use(new EventsApi(request));
  },
  eventsList: async ({ eventsApi }, use) => {
    const response = await eventsApi.getEvents();
    await expect(response).toBeOK();
    await use((await response.json()) as EventsResponse);
  },
});
export { expect } from '@playwright/test';
