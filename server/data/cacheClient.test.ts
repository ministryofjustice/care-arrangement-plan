import { createClient } from 'redis';

import config from '../config';

import createCacheClient from './cacheClient';

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
  })),
}));

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;

const testCacheToken = ['test', 'Cache', 'Token'].join('');

describe('createCacheClient', () => {
  const originalCache = config.cache;

  afterEach(() => {
    config.cache = originalCache;
  });

  it('connects with the TLS-enabled rediss scheme', () => {
    config.cache = {
      enabled: true,
      host: 'cache.example.com',
      password: testCacheToken,
      tls_enabled: true,
    };

    createCacheClient();

    expect(mockedCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'rediss://cache.example.com',
        password: testCacheToken,
        socket: expect.objectContaining({
          tls: true,
        }),
      }),
    );
    expect(mockedCreateClient.mock.calls[0][0]?.url?.startsWith('rediss://')).toBe(true);
    expect(mockedCreateClient.mock.calls[0][0]?.url?.startsWith('redis://')).toBe(false);
  });
});
