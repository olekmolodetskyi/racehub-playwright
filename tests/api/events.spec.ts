import { test, expect } from '../../src/fixtures/api.fixture';

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
