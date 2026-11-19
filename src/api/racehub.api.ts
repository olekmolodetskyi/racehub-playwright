import type { APIRequestContext } from '@playwright/test';

export interface HealthResponse {
  status: string;
  version: string;
  env: string;
}

export interface EventsResponse {
  items: Event[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Distance {
  id: number;
  name: string;
  lengthKm: number;
  category: string;
}
export type EventStatus = 'published' | 'cancelled' | 'finished';
export type RegistrationState = 'upcoming' | 'open' | 'sold_out' | 'closed' | 'cancelled' | 'finished';
export interface Event {
  id: number;
  slug: string;
  title: string;
  city: string;
  currency: string;
  status: EventStatus;
  registrationState: RegistrationState;
  minPriceMinor: number;
  startsAt: string;
  cover: string | null;
  coverAlt: string | null;
  distances: Distance[];
}

export class HealthApi {
  constructor(private readonly request: APIRequestContext) {}
  getHealth() {
    return this.request.get('/api/health');
  }
}

export class EventsApi {
  constructor(private readonly request: APIRequestContext) {}
  getEvents() {
    return this.request.get('/api/events');
  }
  query(params: EventQuery = {}) {
    return this.request.get('/api/events', { params });
  }
}

export type EventQuery = {
  q?: string;
  sort?: string;
  city?: string;
  distance?: string;
  from?: string;
  to?: string;
  past?: boolean;
  page?: number;
};
