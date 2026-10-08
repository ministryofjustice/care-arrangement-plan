import { Request } from 'express';

import config from '../config';
import logger from '../logging/logger';
import { generateHashedIdentifier } from '../utils/hashedIdentifier';

import sendDownloadFormEvent from './googleAnalyticsService';

jest.mock('../logging/logger', () => ({
  debug: jest.fn(),
}));

jest.mock('../utils/hashedIdentifier', () => ({
  generateHashedIdentifier: jest.fn(() => 'hashed-client'),
}));

const mockedLogger = logger as jest.Mocked<typeof logger>;
const mockedGenerateHashedIdentifier = generateHashedIdentifier as jest.MockedFunction<typeof generateHashedIdentifier>;

const requestFor = (overrides: Partial<Request> = {}): Request =>
  ({
    path: '/download-paper-form',
    ip: '192.168.1.1',
    cookies: {},
    get: jest.fn((header: string) => {
      if (header === 'user-agent') {
        return 'Mozilla/5.0';
      }
      if (header === 'referer') {
        return 'https://partner.example/form?user=1';
      }
      return undefined;
    }),
    ...overrides,
  }) as unknown as Request;

describe('googleAnalyticsService', () => {
  const mockFetch = jest.fn();
  const originalAnalytics = { ...config.analytics };

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    config.analytics.enabled = true;
    config.analytics.ga4Id = 'G-TEST';
    config.analytics.apiSecret = 'test-secret';
  });

  afterAll(() => {
    config.analytics.enabled = originalAnalytics.enabled;
    config.analytics.ga4Id = originalAnalytics.ga4Id;
    config.analytics.apiSecret = originalAnalytics.apiSecret;
  });

  it('does not call fetch when analytics is disabled', () => {
    config.analytics.enabled = false;

    sendDownloadFormEvent(requestFor());

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not call fetch when the API secret is missing', () => {
    config.analytics.apiSecret = undefined;

    sendDownloadFormEvent(requestFor());

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not call fetch when analytics cookies were rejected', () => {
    sendDownloadFormEvent(
      requestFor({
        cookies: { cookie_policy: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'No' })) },
      }),
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends a download_form event to the Measurement Protocol', () => {
    mockFetch.mockResolvedValue({});

    sendDownloadFormEvent(requestFor());

    expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith('192.168.1.1', 'Mozilla/5.0');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, options] = mockFetch.mock.calls[0];
    expect(calledUrl).toBeInstanceOf(URL);
    expect(calledUrl.origin + calledUrl.pathname).toBe('https://www.google-analytics.com/mp/collect');
    expect(calledUrl.searchParams.get('measurement_id')).toBe('G-TEST');
    expect(calledUrl.searchParams.get('api_secret')).toBe('test-secret');

    const body = JSON.parse(options.body);
    expect(body.client_id).toBe('hashed-client');
    expect(body.events[0].name).toBe('download_form');
    expect(body.events[0].params).toMatchObject({
      engagement_time_msec: 1,
      link_url: '/download-paper-form',
      page_referrer: 'https://partner.example',
    });
    expect(body.events[0].params.session_id).toEqual(expect.stringMatching(/^\d+$/));
  });

  it('omits an invalid referrer', () => {
    mockFetch.mockResolvedValue({});

    sendDownloadFormEvent(
      requestFor({
        get: jest.fn((header: string) => (header === 'user-agent' ? 'Mozilla/5.0' : 'not a url')) as Request['get'],
      }),
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.events[0].params.page_referrer).toBeUndefined();
  });

  it('logs debug and does not throw when fetch fails', async () => {
    const error = new Error('network error');
    mockFetch.mockRejectedValue(error);

    expect(() => sendDownloadFormEvent(requestFor())).not.toThrow();

    await Promise.resolve();

    expect(mockedLogger.debug).toHaveBeenCalledWith(
      { err: error },
      'Failed to send download_form event to Google Analytics',
    );
  });
});
