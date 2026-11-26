import { test, expect } from '../../src/fixtures/api.fixture';
import { type EventsResponse, type EventDetails, type ErrorResponse } from '../../src/api/racehub.api';
import { normalize } from '../../src/utils/text';
import { itemAt } from '../../src/utils/arrays';

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

  test('filters by date range', { tag: ['@api', '@EVT-03'] }, async ({ eventsList, eventsApi }) => {
    const event = itemAt(eventsList.items, 2);
    const searchDay = event.startsAt.slice(0, 10);
    const response = await eventsApi.query({ from: searchDay, to: searchDay });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EventsResponse;
    expect(body.items.length).toBeGreaterThan(0);
    for (const event of body.items) {
      const day = event.startsAt.slice(0, 10);
      expect(day >= searchDay && day <= searchDay, `event ${event.slug} on ${day}`).toBe(true);
    }
  });
});

test.describe('Pagination', { tag: ['@api', '@EVT-05'] }, () => {
  test('returns 10 events per page', async ({ eventsList, eventsApi }) => {
    const eventNumber = 10;
    expect(eventsList.pageSize).toBe(eventNumber);
    const response = await eventsApi.query({ page: 1 });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EventsResponse;
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items).toHaveLength(eventNumber);
  });

  test('all pages return all events and events on all pages are unique', async ({ eventsList, eventsApi }) => {
    const totalEvents = eventsList.total;
    const pageSize = eventsList.pageSize;
    const allEventIds: number[] = [];
    const lastPage = Math.ceil(totalEvents / pageSize);
    for (let page = 1; page <= lastPage; page++) {
      const response = await eventsApi.query({ page: page });
      expect(response.status()).toBe(200);
      const body = (await response.json()) as EventsResponse;
      allEventIds.push(...body.items.map((event) => event.id));
    }
    expect(allEventIds).toHaveLength(totalEvents);
    expect(new Set(allEventIds).size).toBe(totalEvents);
  });
});

test.describe('Event details', { tag: ['@api', '@EVT-08'] }, () => {
  test('get event details', async ({ eventsList, eventsApi }) => {
    const summary = itemAt(eventsList.items, 0);
    const response = await eventsApi.getBySlug(summary.slug);
    await expect(response).toBeOK();
    const details = (await response.json()) as EventDetails;
    expect(details).toMatchObject({
      id: summary.id,
      slug: summary.slug,
      title: summary.title,
      city: summary.city,
      currency: summary.currency,
      status: summary.status,
      registrationState: summary.registrationState,
      minPriceMinor: summary.minPriceMinor,
      startsAt: summary.startsAt,
      cover: summary.cover,
      coverAlt: summary.coverAlt,
      registrationOpensAt: summary.registrationOpensAt,
      registrationClosesAt: summary.registrationClosesAt,
      description: expect.stringMatching(/\S/),
      organizerName: expect.stringMatching(/\S/),
      distances: summary.distances,
    });
    expect(details.distances.length).toBeGreaterThan(0);
    for (const distance of details.distances) {
      expect(distance, `distance ${distance.id}`).toMatchObject({
        priceMinor: expect.any(Number),
        capacity: expect.any(Number),
        spotsLeft: expect.any(Number),
        startTime: expect.any(String),
      });
    }
  });

  test('returns 404 for a nonexistent slug', async ({ eventsApi }) => {
    const response = await eventsApi.getBySlug('non-existing-slug');
    expect(response.status()).toBe(404);
    const body = (await response.json()) as ErrorResponse;
    expect(body).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: 'Not found.',
      },
    });
  });

  test(`returns 404 for id instead slug`, async ({ eventsList, eventsApi }) => {
    const eventId = itemAt(eventsList.items, 0).id;
    const response = await eventsApi.getBySlug(`${eventId}`);
    expect(response.status()).toBe(404);
    const body = (await response.json()) as ErrorResponse;
    expect(body).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: 'Not found.',
      },
    });
  });

  test('distance invariants hold for events on the first page', async ({ eventsList, eventsApi }) => {
    expect(eventsList.items.length).toBeGreaterThan(0);
    for (const event of eventsList.items) {
      const response = await eventsApi.getBySlug(event.slug);
      await expect(response).toBeOK();
      const details = (await response.json()) as EventDetails;
      expect(details.distances.length).toBeGreaterThan(0);
      const priceMinors = details.distances.map((distance) => distance.priceMinor);
      for (const distance of details.distances) {
        const eventDetailAndDistance = `event ${details.slug}, distance ${distance.id}`;
        expect(distance.spotsLeft, `spotsLeft ${eventDetailAndDistance}`).toBeGreaterThanOrEqual(0);
        expect(distance.spotsLeft, `spotsLeft ${eventDetailAndDistance}`).toBeLessThanOrEqual(distance.capacity);
        expect(distance.priceMinor, `priceMinor ${eventDetailAndDistance}`).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(distance.priceMinor), `priceMinor ${eventDetailAndDistance} is not integer!`).toBe(
          true,
        );
      }
      const minPrice = Math.min(...priceMinors);
      expect(
        details.minPriceMinor === minPrice,
        `minPriceMinor event ${details.slug} is not minimal (${minPrice})!`,
      ).toBe(true);
    }
  });
});

test.describe('Negative cases', { tag: ['@api'] }, () => {
  const invalidQueries = {
    from: [
      { name: 'wrong date format', value: '01-12-2026' },
      { name: 'almost correct date format', value: '2026-12-1' },
    ],
    to: [
      { name: 'wrong date format', value: '2026/12/31' },
      { name: 'almost correct date format', value: '2026-12-1' },
    ],
    distance: [
      { name: 'value not from the list', value: 'ultra' },
      { name: 'combination of correct value and non-correct', value: '5k,ultra' },
    ],
    past: [{ name: 'non-boolean value', value: 'yes' }],
    sort: [{ name: 'value not from the list', value: 'distance_asc' }],
    page: [
      { name: 'not a number', value: 'first' },
      { name: 'less than min', value: '0' },
      { name: 'more than max', value: '1001' },
      { name: 'not integer', value: '1.5' },
    ],
    q: [{ name: 'more than max', value: 'x'.repeat(101) }],
    city: [{ name: 'more than max', value: 'x'.repeat(101) }],
  };

  for (const [field, cases] of Object.entries(invalidQueries)) {
    test.describe(`${field}`, () => {
      for (const { name, value } of cases) {
        test(`rejects ${name}`, async ({ eventsApi }) => {
          const response = await eventsApi.queryRaw({ [field]: value });
          expect(response.status()).toBe(400);
          const body = (await response.json()) as ErrorResponse;
          expect(body.error.code).toBe('BAD_REQUEST');
          expect(body.error.details).toContainEqual(expect.objectContaining({ field }));
        });
      }
    });
  }

  test.describe(`Rejects non-existing dates`, () => {
    const nonExistingDate = '2050-02-30';

    test(`for from`, async ({ eventsApi }) => {
      test.fail(true, 'Known bug: https://github.com/olekmolodetskyi/racehub/issues/21');
      const response = await eventsApi.query({ from: nonExistingDate });
      expect(response.status()).toBe(400);
      const body = (await response.json()) as ErrorResponse;
      expect(body.error.code).toBe('BAD_REQUEST');
      expect(body.error.details).toContainEqual(expect.objectContaining({ field: 'from' }));
    });

    test(`for to`, async ({ eventsApi }) => {
      test.fail(true, 'Known bug: https://github.com/olekmolodetskyi/racehub/issues/21');
      const response = await eventsApi.query({ to: nonExistingDate });
      expect(response.status()).toBe(400);
      const body = (await response.json()) as ErrorResponse;
      expect(body.error.code).toBe('BAD_REQUEST');
      expect(body.error.details).toContainEqual(expect.objectContaining({ field: 'to' }));
    });

    test(`for from and to`, async ({ eventsApi }) => {
      test.fail(true, 'Known bug: https://github.com/olekmolodetskyi/racehub/issues/21');
      const response = await eventsApi.query({ from: nonExistingDate, to: nonExistingDate });
      expect(response.status()).toBe(400);
      const body = (await response.json()) as ErrorResponse;
      expect(body.error.code).toBe('BAD_REQUEST');
      expect(body.error.details).toContainEqual(expect.objectContaining({ field: 'from' }));
    });
  });
});

test.describe(`Boundary values`, { tag: ['@api'] }, () => {
  const validQueries = {
    city: [{ name: 'exactly max value', value: 'x'.repeat(100) }],
    page: [
      { name: 'exactly max value', value: '1000' },
      { name: 'exactly min value', value: '1' },
    ],
  };

  for (const [field, cases] of Object.entries(validQueries)) {
    test.describe(`${field}`, () => {
      for (const { name, value } of cases) {
        test(`accepts ${name}`, async ({ eventsApi }) => {
          const response = await eventsApi.queryRaw({ [field]: value });
          expect(response.status()).toBe(200);
        });
      }
    });
  }

  test(`exactly max value q`, async ({ eventsApi }) => {
    test.fail(true, 'Known bug: https://github.com/olekmolodetskyi/racehub/issues/20');
    const response = await eventsApi.query({ q: 'x'.repeat(100) });
    expect(response.status()).toBe(200);
  });
});

test(`from later than to`, { tag: ['@api'] }, async ({ eventsList, eventsApi }) => {
  const earliest = itemAt(eventsList.items, 0).startsAt.slice(0, 10);
  const latest = itemAt(eventsList.items, eventsList.items.length - 1).startsAt.slice(0, 10);
  const normal = await eventsApi.query({ from: earliest, to: latest });
  await expect(normal).toBeOK();
  const normalList = (await normal.json()) as EventsResponse;
  expect(normalList.total).toBeGreaterThan(0);
  const reversed = await eventsApi.query({ from: latest, to: earliest });
  expect(reversed.status()).toBe(200);
  const reversedList = (await reversed.json()) as EventsResponse;
  expect(reversedList.total).toBe(0);
});
