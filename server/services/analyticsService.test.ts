import { Request, Response } from 'express';

import config from '../config';
import logger from '../logging/logger';
import { generateHashedIdentifier } from '../utils/hashedIdentifier';

import { logDownload, logLinkClick, logPageExit, logPageVisit, logQuickExit } from './analyticsService';

// Mock the logger
jest.mock('../logging/logger', () => ({
  info: jest.fn(),
}));

// Mock the hashedIdentifier module
jest.mock('../utils/hashedIdentifier', () => ({
  generateHashedIdentifier: jest.fn(),
}));

describe('analyticsService', () => {
  // Ensure analytics is enabled for tests
  beforeAll(() => {
    config.analytics.enabled = true;
  });
  const mockedLogger = logger as jest.Mocked<typeof logger>;
  const mockedGenerateHashedIdentifier = generateHashedIdentifier as jest.MockedFunction<typeof generateHashedIdentifier>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logPageVisit', () => {
    it('logs a page visit event with hashed user identifier', () => {
      // Setup
      const mockHashedId = 'abc123def4567890';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        method: 'GET',
        path: '/task-list',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
      } as unknown as Request;

      const mockRes = {
        statusCode: 200,
      } as Response;

      // Execute
      logPageVisit(mockReq, mockRes);

      // Assert - hashedIdentifier was called with IP and User-Agent
      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '192.168.1.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      );

      // Assert - logger was called with correct event data
      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          event_type: 'page_visit',
          hashed_user_id: mockHashedId,
          path: '/task-list',
          method: 'GET',
          status_code: 200,
        }),
        'page_visit event'
      );
    });

    it('handles requests with missing IP address', () => {
      const mockHashedId = 'xyz789abc1234567';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        method: 'POST',
        path: '/about-the-children',
        ip: undefined,
        get: jest.fn().mockReturnValue('Chrome/120.0'),
      } as unknown as Request;

      const mockRes = {
        statusCode: 200,
      } as Response;

      logPageVisit(mockReq, mockRes);

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        undefined,
        'Chrome/120.0'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_user_id: mockHashedId,
        }),
        'page_visit event'
      );
    });

    it('handles requests with missing User-Agent', () => {
      const mockHashedId = 'def456ghi7891011';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        method: 'GET',
        path: '/cookies',
        ip: '10.0.0.5',
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      const mockRes = {
        statusCode: 200,
      } as Response;

      logPageVisit(mockReq, mockRes);

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '10.0.0.5',
        undefined
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_user_id: mockHashedId,
        }),
        'page_visit event'
      );
    });

    it('generates different hashed IDs for different IPs', () => {
      const userAgent = 'Mozilla/5.0';

      // First request
      mockedGenerateHashedIdentifier.mockReturnValueOnce('hash1111111111');
      const mockReq1 = {
        method: 'GET',
        path: '/task-list',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue(userAgent),
      } as unknown as Request;
      const mockRes1 = { statusCode: 200 } as Response;

      logPageVisit(mockReq1, mockRes1);

      // Second request with different IP
      mockedGenerateHashedIdentifier.mockReturnValueOnce('hash2222222222');
      const mockReq2 = {
        method: 'GET',
        path: '/task-list',
        ip: '192.168.1.2',
        get: jest.fn().mockReturnValue(userAgent),
      } as unknown as Request;
      const mockRes2 = { statusCode: 200 } as Response;

      logPageVisit(mockReq2, mockRes2);

      // Verify different calls
      expect(mockedGenerateHashedIdentifier).toHaveBeenNthCalledWith(1, '192.168.1.1', userAgent);
      expect(mockedGenerateHashedIdentifier).toHaveBeenNthCalledWith(2, '192.168.1.2', userAgent);

      // Verify different hashed IDs were logged
      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ hashed_user_id: 'hash1111111111' }),
        'page_visit event'
      );
      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ hashed_user_id: 'hash2222222222' }),
        'page_visit event'
      );
    });

    it('includes timestamp in ISO format', () => {
      mockedGenerateHashedIdentifier.mockReturnValue('abc123');

      const mockReq = {
        method: 'GET',
        path: '/task-list',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as unknown as Request;

      const mockRes = { statusCode: 200 } as Response;

      logPageVisit(mockReq, mockRes);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        }),
        'page_visit event'
      );
    });
  });

  describe('logDownload', () => {
    it('logs a download event for output_pdf with correct structure', () => {
      const mockHashedId = 'download123456789';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/download-pdf',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      logDownload(mockReq, 'output_pdf');

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          event_type: 'download',
          hashed_user_id: mockHashedId,
          download_type: 'output_pdf',
          path: '/download-pdf',
        }),
        'download event'
      );
    });

    it('logs a download event for output_html with correct structure', () => {
      const mockHashedId = 'htmldownload12345';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/download-html',
        ip: '192.168.1.2',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      logDownload(mockReq, 'output_html');

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'download',
          hashed_user_id: mockHashedId,
          download_type: 'output_html',
          path: '/download-html',
        }),
        'download event'
      );
    });

    it('logs a download event for offline_pdf with correct structure', () => {
      const mockHashedId = 'offlinepdf123456';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/download-paper-form',
        ip: '192.168.1.3',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      logDownload(mockReq, 'offline_pdf');

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'download',
          hashed_user_id: mockHashedId,
          download_type: 'offline_pdf',
          path: '/download-paper-form',
        }),
        'download event'
      );
    });

    it('handles requests with missing IP address', () => {
      const mockHashedId = 'noipdownload12345';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/download-pdf',
        ip: undefined,
        get: jest.fn().mockReturnValue('Chrome/120.0'),
      } as unknown as Request;

      logDownload(mockReq, 'output_pdf');

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        undefined,
        'Chrome/120.0'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_user_id: mockHashedId,
        }),
        'download event'
      );
    });
  });

  describe('logLinkClick', () => {
    it('logs a link click event with link text', () => {
      const mockHashedId = 'linkclick1234567';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/link-click',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      const linkUrl = 'https://www.gov.uk/looking-after-children-divorce';
      const linkText = 'More information and support';
      const linkType = 'external';
      const currentPage = '/share-plan';

      logLinkClick(mockReq, linkUrl, linkText, linkType, currentPage);

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          event_type: 'link_click',
          hashed_user_id: mockHashedId,
          link_url: linkUrl,
          link_text: linkText,
          link_type: linkType,
          page: currentPage,
        }),
        'link_click event'
      );
    });

    it('logs a link click event without link text when not provided', () => {
      const mockHashedId = 'linkclick7654321';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/link-click',
        ip: '192.168.1.2',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      const linkUrl = 'https://www.smartsurvey.co.uk/s/EFO5FJ/';

      logLinkClick(mockReq, linkUrl);

      const callArgs = mockedLogger.info.mock.calls[0][0];

      expect(callArgs).toMatchObject({
        timestamp: expect.any(String),
        event_type: 'link_click',
        hashed_user_id: mockHashedId,
        link_url: linkUrl,
        page: '/api/analytics/link-click',
      });

      expect(callArgs.link_text).toBeUndefined();
    });

    it('tracks different external links with their URLs', () => {
      mockedGenerateHashedIdentifier.mockReturnValue('sameuser12345678');

      const mockReq = {
        path: '/api/analytics/link-click',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as unknown as Request;

      const govLink = 'https://www.gov.uk/looking-after-children-divorce';
      const surveyLink = 'https://www.smartsurvey.co.uk/s/EFO5FJ/';
      const currentPage = '/share-plan';

      logLinkClick(mockReq, govLink, 'Gov.uk Link', currentPage);
      logLinkClick(mockReq, surveyLink, 'Survey Link', currentPage);

      expect(mockedLogger.info).toHaveBeenCalledTimes(2);

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          link_url: govLink,
          link_text: 'Gov.uk Link',
        }),
        'link_click event'
      );

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          link_url: surveyLink,
          link_text: 'Survey Link',
        }),
        'link_click event'
      );
    });

    it('handles requests with missing User-Agent', () => {
      const mockHashedId = 'nouaclick1234567';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/link-click',
        ip: '10.0.0.5',
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      logLinkClick(mockReq, 'https://www.gov.uk/link', undefined, '/task-list');

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '10.0.0.5',
        undefined
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_user_id: mockHashedId,
        }),
        'link_click event'
      );
    });
  });

  describe('logPageExit', () => {
    it('logs a page exit event with correct structure', () => {
      const mockHashedId = 'pageexit12345678';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/page-exit',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      const exitPage = '/share-plan';

      logPageExit(mockReq, exitPage);

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          event_type: 'page_exit',
          hashed_user_id: mockHashedId,
          exit_page: exitPage,
          path: '/api/analytics/page-exit',
        }),
        'page_exit event'
      );
    });

    it('logs page exit from different pages', () => {
      mockedGenerateHashedIdentifier.mockReturnValue('sameuser12345678');

      const mockReq = {
        path: '/api/analytics/page-exit',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as unknown as Request;

      logPageExit(mockReq, '/task-list');
      logPageExit(mockReq, '/confirmation');

      expect(mockedLogger.info).toHaveBeenCalledTimes(2);

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          exit_page: '/task-list',
        }),
        'page_exit event'
      );

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          exit_page: '/confirmation',
        }),
        'page_exit event'
      );
    });

    it('handles requests with missing IP address', () => {
      const mockHashedId = 'noipexitpage1234';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/page-exit',
        ip: undefined,
        get: jest.fn().mockReturnValue('Chrome/120.0'),
      } as unknown as Request;

      logPageExit(mockReq, '/share-plan');

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        undefined,
        'Chrome/120.0'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_user_id: mockHashedId,
        }),
        'page_exit event'
      );
    });
  });

  describe('logQuickExit', () => {
    it('logs a quick exit event with correct structure', () => {
      const mockHashedId = 'quickexit1234567';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/quick-exit',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
      } as unknown as Request;

      const exitPage = '/safety-check';

      logQuickExit(mockReq, exitPage);

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          event_type: 'quick_exit',
          hashed_user_id: mockHashedId,
          exit_page: exitPage,
          path: '/api/analytics/quick-exit',
        }),
        'quick_exit event'
      );
    });

    it('logs quick exit from different safety pages', () => {
      mockedGenerateHashedIdentifier.mockReturnValue('sameuser12345678');

      const mockReq = {
        path: '/api/analytics/quick-exit',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as unknown as Request;

      logQuickExit(mockReq, '/safety-check');
      logQuickExit(mockReq, '/children-safety-check');

      expect(mockedLogger.info).toHaveBeenCalledTimes(2);

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          exit_page: '/safety-check',
        }),
        'quick_exit event'
      );

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          exit_page: '/children-safety-check',
        }),
        'quick_exit event'
      );
    });

    it('handles requests with missing User-Agent', () => {
      const mockHashedId = 'nouaquickexit123';
      mockedGenerateHashedIdentifier.mockReturnValue(mockHashedId);

      const mockReq = {
        path: '/api/analytics/quick-exit',
        ip: '10.0.0.5',
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      logQuickExit(mockReq, '/safety-check');

      expect(mockedGenerateHashedIdentifier).toHaveBeenCalledWith(
        '10.0.0.5',
        undefined
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_user_id: mockHashedId,
        }),
        'quick_exit event'
      );
    });
  });
});
