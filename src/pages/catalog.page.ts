import type { Locator, Page } from '@playwright/test';
import { EventCard } from '../components/event-card';

export class CatalogPage {
  readonly heading: Locator;
  readonly raceCounter: Locator;
  readonly events: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.raceCounter = page.getByTestId('results-count');
    this.events = page.getByRole('article');
  }

  async goto() {
    await this.page.goto('/');
  }

  event(index: number) {
    return new EventCard(this.events.nth(index));
  }
}
