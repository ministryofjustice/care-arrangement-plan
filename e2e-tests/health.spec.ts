import { test, expect } from '@playwright/test';

test.describe('Healthcheck', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });
});
