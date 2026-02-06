import type { Request, Response } from 'express';

import config from '../config';
import cookieNames from '../constants/cookieNames';

import setupAnalytics from './setupAnalytics';

describe('setupAnalytics', () => {
  let request: Request;
  let response: Response;
  const next = jest.fn();

  beforeEach(() => {
    request = {} as Request;
    response = { locals: {} } as Response;
    // Reset analytics enabled to true for most tests
    config.analytics.enabled = true;
  });

  it('should set locals.analyticsEnabled to true if consent cookie set to yes', () => {
    request.cookies = {
      [cookieNames.ANALYTICS_CONSENT]: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'Yes' })),
    };

    setupAnalytics()(request, response, next);

    expect(response.locals.analyticsEnabled).toBe(true);
    expect(response.locals.analyticsEnvironmentEnabled).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it('should set locals.analyticsEnabled to false if consent cookie set to no', () => {
    request.cookies = {
      [cookieNames.ANALYTICS_CONSENT]: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'No' })),
    };

    setupAnalytics()(request, response, next);

    expect(response.locals.analyticsEnabled).toBe(false);
    expect(next).toHaveBeenCalled();
  });

  it('should set locals.analyticsEnabled to undefined if consent cookie set to invalid value', () => {
    request.cookies = { [cookieNames.ANALYTICS_CONSENT]: 'NOT-A-JSON-STRING' };

    setupAnalytics()(request, response, next);

    expect(response.locals.analyticsEnabled).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set locals.analyticsEnabled to undefined if consent cookie is not set', () => {
    request.cookies = undefined;

    setupAnalytics()(request, response, next);

    expect(response.locals.analyticsEnabled).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set locals.ga4Id to undefined if it does not exist', () => {
    config.analytics.ga4Id = undefined;

    setupAnalytics()(request, response, next);

    expect(response.locals.ga4Id).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set locals.ga4Id if it exists', () => {
    const ga4Id = 'test-ga4-id';
    config.analytics.ga4Id = ga4Id;

    setupAnalytics()(request, response, next);

    expect(response.locals.ga4Id).toBe(ga4Id);
    expect(next).toHaveBeenCalled();
  });

  describe('when analytics is disabled at environment level', () => {
    beforeEach(() => {
      config.analytics.enabled = false;
    });

    it('should set analyticsEnabled to false regardless of consent cookie', () => {
      request.cookies = {
        [cookieNames.ANALYTICS_CONSENT]: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'Yes' })),
      };

      setupAnalytics()(request, response, next);

      expect(response.locals.analyticsEnabled).toBe(false);
      expect(response.locals.analyticsEnvironmentEnabled).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it('should set ga4Id to undefined', () => {
      config.analytics.ga4Id = 'test-ga4-id';

      setupAnalytics()(request, response, next);

      expect(response.locals.ga4Id).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
