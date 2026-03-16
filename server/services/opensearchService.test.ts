import config from '../config';
import logger from '../logging/logger';

import sendToOpenSearch from './opensearchService';

jest.mock('../logging/logger', () => ({
  debug: jest.fn(),
}));

const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('opensearchService', () => {
  const mockFetch = jest.fn();

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when proxyUrl is not configured', () => {
    it('does not call fetch', () => {
      config.opensearch.proxyUrl = '';

      sendToOpenSearch({ event_type: 'page_visit' });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('when proxyUrl is configured', () => {
    beforeEach(() => {
      config.opensearch.proxyUrl = 'https://proxy.example.com';
    });

    it('POSTs the event to the correct URL with JSON body', () => {
      mockFetch.mockResolvedValue({});

      const event = { event_type: 'page_visit', status_code: 200 };
      sendToOpenSearch(event);

      expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/cap-analytics/_doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    });

    it('logs debug and does not throw when fetch fails', async () => {
      const error = new Error('network error');
      mockFetch.mockRejectedValue(error);

      expect(() => sendToOpenSearch({ event_type: 'page_visit' })).not.toThrow();

      // Allow the rejected promise to settle
      await Promise.resolve();

      expect(mockedLogger.debug).toHaveBeenCalledWith({ err: error }, 'Failed to send event to OpenSearch');
    });
  });
});
