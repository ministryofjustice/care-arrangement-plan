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

  it('enables TLS when the cache is configured to use it', () => {
    config.cache = {
      enabled: true,
      host: 'cache.example.com',
      password: testCacheToken,
      tls_enabled: true,
    };

    createCacheClient();

    expect(mockedCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        password: testCacheToken,
        socket: expect.objectContaining({
          host: 'cache.example.com',
          tls: true,
        }),
      }),
    );
    expect(mockedCreateClient.mock.calls[0][0]).not.toHaveProperty('url');
  });

  it('does not enable TLS when it is disabled for local cache', () => {
    config.cache = {
      enabled: true,
      host: 'localhost',
      password: testCacheToken,
      tls_enabled: false,
    };

    createCacheClient();

    expect(mockedCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        socket: expect.objectContaining({
          host: 'localhost',
        }),
      }),
    );
    expect(mockedCreateClient.mock.calls[0][0]).not.toHaveProperty('url');
    expect(mockedCreateClient.mock.calls[0][0]?.socket).not.toHaveProperty('tls', true);
  });
});
