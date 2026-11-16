import { test, expect } from '../../src/fixtures/catalog.fixture';

test.describe('Catalog tests', () => {
  test.beforeEach(async ({ catalogPage }) => {
    await catalogPage.goto();
  });

  test('Guest sees catalog of events on page', { tag: '@EVT-01' }, async ({ catalogPage }) => {
    await expect(catalogPage.raceCounter).toHaveText(/^\d+ events?$/);
    const eventCard = catalogPage.event(0);
    await expect(eventCard.image).toBeVisible();
    await expect(eventCard.day).toBeVisible();
    await expect(eventCard.month).toBeVisible();
    await expect(eventCard.name).toBeVisible();
    await expect(eventCard.statusBadge).toBeVisible();
    await expect(eventCard.statusBadge).toHaveAttribute('data-state', /^(upcoming|closed|open|sold_out|cancelled)$/);
    await expect(eventCard.distance).toBeVisible();
    await expect(eventCard.price).toBeVisible();
  });
});
