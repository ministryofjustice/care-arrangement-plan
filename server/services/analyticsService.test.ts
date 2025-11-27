import { Request, Response } from 'express';

import { logPageVisit } from './analyticsService';
import logger from '../logging/logger';
import { generateHashedIdentifier } from '../utils/hashedIdentifier';

// Mock the logger
jest.mock('../logging/logger', () => ({
  info: jest.fn(),
}));

// Mock the hashedIdentifier module
jest.mock('../utils/hashedIdentifier', () => ({
  generateHashedIdentifier: jest.fn(),
}));

describe('analyticsService', () => {
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
});
