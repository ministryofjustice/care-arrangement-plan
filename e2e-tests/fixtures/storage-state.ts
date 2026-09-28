import type { BrowserContextOptions } from '@playwright/test';

export const emptyStorageState: BrowserContextOptions['storageState'] = {
  cookies: [],
  origins: [],
};

export const dismissedCookieBannerStorageState: BrowserContextOptions['storageState'] = {
  cookies: [
    {
      name: 'cookie_policy',
      value: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'No' })),
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ],
  origins: [],
};
