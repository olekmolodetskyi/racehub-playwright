import type { APIRequestContext } from '@playwright/test';

export interface HealthResponse {
  status: string;
  version: string;
  env: string;
}

export class HealthApi {
  constructor(private readonly request: APIRequestContext) {}
  getHealth() {
    return this.request.get('/api/health');
  }
}
