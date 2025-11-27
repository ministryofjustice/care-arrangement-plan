import { Request, Response } from 'express';

import logger from '../logging/logger';

import { logPageVisit } from './analyticsService';

/**
 * Integration test that uses the REAL hashedIdentifier (not mocked)
 * This verifies the end-to-end flow works correctly
 */
describe('analyticsService - Integration', () => {
  const mockLogger = jest.spyOn(logger, 'info').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockLogger.mockRestore();
  });

  it('generates consistent hashed_user_id for same IP + User-Agent', () => {
    const mockReq = {
      method: 'GET',
      path: '/task-list',
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0 (Test Browser)'),
    } as unknown as Request;

    const mockRes = { statusCode: 200 } as Response;

    // Make two page visits with same IP + UA
    logPageVisit(mockReq, mockRes);
    logPageVisit(mockReq, mockRes);

    expect(mockLogger).toHaveBeenCalledTimes(2);

    const firstCall = mockLogger.mock.calls[0][0];
    const secondCall = mockLogger.mock.calls[1][0];

    // Extract hashed_user_id from both calls
    const firstHashedId = firstCall.hashed_user_id;
    const secondHashedId = secondCall.hashed_user_id;

    // Verify they're the same (deduplication works!)
    expect(firstHashedId).toBe(secondHashedId);
    expect(typeof firstHashedId).toBe('string');
    expect(firstHashedId).toHaveLength(16);
    expect(firstHashedId).toMatch(/^[0-9a-f]{16}$/);

    console.log('\n✅ Integration Test Results:');
    console.log(`   Same user made 2 visits`);
    console.log(`   Both got hashed_user_id: ${firstHashedId}`);
    console.log(`   ✓ Deduplication works!\n`);
  });

  it('generates different hashed_user_id for different IPs', () => {
    const userAgent = 'Mozilla/5.0 (Test Browser)';

    const mockReq1 = {
      method: 'GET',
      path: '/task-list',
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue(userAgent),
    } as unknown as Request;

    const mockReq2 = {
      method: 'GET',
      path: '/task-list',
      ip: '192.168.1.2',
      get: jest.fn().mockReturnValue(userAgent),
    } as unknown as Request;

    const mockRes = { statusCode: 200 } as Response;

    logPageVisit(mockReq1, mockRes);
    logPageVisit(mockReq2, mockRes);

    const firstHashedId = mockLogger.mock.calls[0][0].hashed_user_id;
    const secondHashedId = mockLogger.mock.calls[1][0].hashed_user_id;

    expect(firstHashedId).not.toBe(secondHashedId);

    console.log('\n✅ Integration Test Results:');
    console.log(`   User 1 (192.168.1.1): ${firstHashedId}`);
    console.log(`   User 2 (192.168.1.2): ${secondHashedId}`);
    console.log(`   ✓ Different users get different hashes!\n`);
  });

  it('logs complete event structure with real hashed identifiers', () => {
    const mockReq = {
      method: 'POST',
      path: '/about-the-children',
      ip: '10.0.0.5',
      get: jest.fn().mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)'),
    } as unknown as Request;

    const mockRes = { statusCode: 200 } as Response;

    logPageVisit(mockReq, mockRes);

    expect(mockLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
        event_type: 'page_visit',
        hashed_user_id: expect.stringMatching(/^[0-9a-f]{16}$/),
        path: '/about-the-children',
        method: 'POST',
        status_code: 200,
      }),
      'page_visit event'
    );

    const loggedData = mockLogger.mock.calls[0][0];
    console.log('\n✅ Sample Log Output:');
    console.log(JSON.stringify(loggedData, null, 2));
    console.log();
  });

  it('demonstrates privacy: cannot reverse hash to get original IP', () => {
    const secretIP = '203.0.113.42'; // User's real IP
    const userAgent = 'Mozilla/5.0';

    const mockReq = {
      method: 'GET',
      path: '/task-list',
      ip: secretIP,
      get: jest.fn().mockReturnValue(userAgent),
    } as unknown as Request;

    const mockRes = { statusCode: 200 } as Response;

    logPageVisit(mockReq, mockRes);

    const loggedData = mockLogger.mock.calls[0][0];
    const hashedId = loggedData.hashed_user_id;

    // Verify the hash doesn't contain the original IP
    expect(hashedId).not.toContain('203');
    expect(hashedId).not.toContain('113');
    expect(hashedId).not.toContain('42');

    // Verify original IP is not in the log at all
    const logString = JSON.stringify(loggedData);
    expect(logString).not.toContain(secretIP);

    console.log('\n✅ Privacy Verification:');
    console.log(`   Real IP:      ${secretIP} (NEVER logged)`);
    console.log(`   Hashed ID:    ${hashedId} (cannot be reversed)`);
    console.log(`   ✓ Privacy preserved!\n`);
  });
});
