import { test, expect } from '@playwright/test';

test.describe('Healthcheck', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('should return JSON content type', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should return expected response body fields', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();

    expect(body).toHaveProperty('gitHash');
    expect(body).toHaveProperty('branch');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('uptime');
  });

  test('should return a non-negative uptime', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();

    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});
