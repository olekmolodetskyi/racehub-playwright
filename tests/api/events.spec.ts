import { test, expect } from '../../src/fixtures/api.fixture';
import { type EventsResponse } from '../../src/api/racehub.api';
import { normalize } from '../../src/utils/text';

test.describe('Default event list', () => {
  test('List events does not contain finished events', { tag: ['@api', '@EVT-01'] }, ({ eventsList }) => {
    const statuses = eventsList.items.map((event) => event.status);
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses).not.toContain('finished');
  });

  test('Events start date is today or later', { tag: ['@api', '@EVT-01'] }, ({ eventsList }) => {
    const today = new Date().toISOString().slice(0, 10);
    expect(eventsList.items.length).toBeGreaterThan(0);
    for (const event of eventsList.items) {
      const eventDay = event.startsAt.slice(0, 10);
      expect(eventDay >= today, `Event ${event.slug} on ${eventDay}`).toBe(true);
    }
  });

  test('List of events is sorted by start date', { tag: ['@api', '@EVT-01'] }, ({ eventsList }) => {
    const dates = eventsList.items.map((event) => event.startsAt);
    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual([...dates].sort());
  });
});

test.describe('Event filters', () => {
  test('filters by city', { tag: ['@api', '@EVT-03'] }, async ({ eventsApi }) => {
    const cityName = 'Lilliport';
    const response = await eventsApi.query({ city: cityName });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EventsResponse;
    expect(body.items.length).toBeGreaterThan(0);
    for (const event of body.items) {
      expect(event.city, `event ${event.slug}`).toBe(cityName);
    }
  });

  test('includes finished events', { tag: ['@api', '@EVT-01'] }, async ({ eventsApi }) => {
    const response = await eventsApi.query({ past: true });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EventsResponse;
    const statuses = body.items.map((event) => event.status);
    expect(body.items.length).toBeGreaterThan(0);
    expect(statuses).toContain('finished');
  });

  test('filters by distance', { tag: ['@api', '@EVT-03'] }, async ({ eventsApi }) => {
    const category = '5k';
    const response = await eventsApi.query({ distance: category });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EventsResponse;
    expect(body.items.length).toBeGreaterThan(0);
    for (const event of body.items) {
      expect(
        event.distances.map((distance) => distance.category),
        `event ${event.slug}`,
      ).toContain(category);
    }
  });

  test('search', { tag: ['@api', '@EVT-02'] }, async ({ eventsApi }) => {
    const query = 'grod';
    const response = await eventsApi.query({ q: query });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EventsResponse;
    expect(body.items.length).toBeGreaterThan(0);
    for (const event of body.items) {
      const searchable = normalize(`${event.title} | ${event.city}`);
      expect(searchable, `event ${event.slug}`).toContain(normalize(query));
    }
  });
});
