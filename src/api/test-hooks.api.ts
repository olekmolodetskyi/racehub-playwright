import { expect, type APIRequestContext } from '@playwright/test';
export class TestHooksApi {
  private readonly testToken: string;
  constructor(private readonly request: APIRequestContext) {
    const testToken = process.env.TEST_TOKEN;
    if (!testToken) throw new Error('TEST_TOKEN is not set, see .env.example');
    this.testToken = testToken;
  }

  async reset() {
    const response = await this.request.post('/api/test/reset', {
      headers: { 'x-test-token': this.testToken },
    });
    await expect(response).toBeOK();
  }

  async seedBaseline() {
    const response = await this.request.post('/api/test/seed', {
      headers: { 'x-test-token': this.testToken },
      data: { fixture: 'baseline' },
    });
    await expect(response).toBeOK();
  }
}
