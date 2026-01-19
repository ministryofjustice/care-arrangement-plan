import type { Request, Response } from 'express';

import config from '../config';
import paths from '../constants/paths';

import setupProductionStartRedirect from './setupProductionStartRedirect';

const GDS_START_PAGE_URL = 'https://www.gov.uk/make-child-arrangements-if-you-divorce-or-separate';

describe('setupProductionStartRedirect middleware', () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock;
  let originalProduction: boolean;
  let originalGdsStartPageUrl: string;
  let router: ReturnType<typeof setupProductionStartRedirect>;

  beforeEach(() => {
    originalProduction = config.production;
    originalGdsStartPageUrl = config.gdsStartPageUrl;

    req = {
      method: 'GET',
      path: paths.START,
    } as unknown as Request;
    res = {
      redirect: jest.fn(),
    } as unknown as Response;
    next = jest.fn();

    (config as { gdsStartPageUrl: string }).gdsStartPageUrl = GDS_START_PAGE_URL;

    router = setupProductionStartRedirect();

    jest.clearAllMocks();
  });

  afterEach(() => {
    (config as { production: boolean }).production = originalProduction;
    (config as { gdsStartPageUrl: string }).gdsStartPageUrl = originalGdsStartPageUrl;
  });

  // Helper to get the middleware handler from the router
  const getMiddlewareHandler = () => {
    // The router.stack contains the registered routes
    // We need to get the handle function from the first layer
    const layer = (router as unknown as { stack: Array<{ handle: Function }> }).stack[0];
    return layer.handle;
  };

  describe('Production mode', () => {
    beforeEach(() => {
      (config as { production: boolean }).production = true;
    });

    describe('when GDS start page URL is configured', () => {
      it('should redirect GET requests to / to the GDS start page', () => {
        req.method = 'GET';
        const handler = getMiddlewareHandler();

        handler(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(GDS_START_PAGE_URL);
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('when GDS start page URL is not configured (interim solution)', () => {
      it('should redirect GET requests to / to safety check when URL is empty', () => {
        (config as { gdsStartPageUrl: string }).gdsStartPageUrl = '';
        router = setupProductionStartRedirect();
        req.method = 'GET';
        const handler = getMiddlewareHandler();

        handler(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(paths.SAFETY_CHECK);
        expect(next).not.toHaveBeenCalled();
      });

      it('should redirect GET requests to / to safety check when URL is "/"', () => {
        (config as { gdsStartPageUrl: string }).gdsStartPageUrl = '/';
        router = setupProductionStartRedirect();
        req.method = 'GET';
        const handler = getMiddlewareHandler();

        handler(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(paths.SAFETY_CHECK);
        expect(next).not.toHaveBeenCalled();
      });
    });

    it('should not redirect POST requests', () => {
      req.method = 'POST';
      const handler = getMiddlewareHandler();

      handler(req, res, next);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should not redirect PUT requests', () => {
      req.method = 'PUT';
      const handler = getMiddlewareHandler();

      handler(req, res, next);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Development mode', () => {
    beforeEach(() => {
      (config as { production: boolean }).production = false;
    });

    it('should not redirect GET requests to /', () => {
      req.method = 'GET';
      const handler = getMiddlewareHandler();

      handler(req, res, next);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should allow access to internal start page', () => {
      const handler = getMiddlewareHandler();

      handler(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
