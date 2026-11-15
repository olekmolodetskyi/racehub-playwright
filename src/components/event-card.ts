import type { Locator } from '@playwright/test';

export class EventCard {
  readonly image: Locator;
  readonly day: Locator;
  readonly month: Locator;
  readonly name: Locator;
  readonly statusBadge: Locator;
  readonly distance: Locator;
  readonly price: Locator;

  constructor(readonly root: Locator) {
    this.image = root.getByRole('img');
    this.day = root.getByText(/^\d{1,2}$/);
    this.month = root.getByText(/^[a-z]{3}$/i);
    this.name = root.getByRole('heading');
    this.statusBadge = root.locator('[data-state]');
    this.distance = root.getByRole('list', { name: 'Distances' });
    this.price = root.getByText(/^from (€|(UAH|PLN)\s)\d{1,3}(,\d{3})*(\.\d{2})?$/);
  }
}
