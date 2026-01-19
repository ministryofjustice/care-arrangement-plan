import type { Request, Response } from 'express';

import config from '../config';
import FORM_STEPS from '../constants/formSteps';

import validateSafetyCheckAccess from './validateSafetyCheckAccess';

const GDS_START_PAGE_URL = 'https://www.gov.uk/make-child-arrangements-if-you-divorce-or-separate';

describe('validateSafetyCheckAccess middleware', () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock;
  let originalProduction: boolean;
  let originalGdsStartPageUrl: string;

  beforeEach(() => {
    originalProduction = config.production;
    originalGdsStartPageUrl = config.gdsStartPageUrl;

    req = {
      session: {
        completedSteps: [],
      },
      get: jest.fn().mockReturnValue(''),
    } as unknown as Request;
    res = {
      redirect: jest.fn(),
    } as unknown as Response;
    next = jest.fn();

    // Default to production mode for most tests
    (config as { production: boolean }).production = true;
    (config as { gdsStartPageUrl: string }).gdsStartPageUrl = GDS_START_PAGE_URL;

    jest.clearAllMocks();
  });

  afterEach(() => {
    (config as { production: boolean }).production = originalProduction;
    (config as { gdsStartPageUrl: string }).gdsStartPageUrl = originalGdsStartPageUrl;
  });

  describe('Production mode', () => {
    beforeEach(() => {
      (config as { production: boolean }).production = true;
    });

    describe('when user comes from GDS start page', () => {
      it('should allow access and call next', () => {
        (req.get as jest.Mock).mockReturnValue(GDS_START_PAGE_URL);

        validateSafetyCheckAccess(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
      });

      it('should mark START step as completed', () => {
        (req.get as jest.Mock).mockReturnValue(GDS_START_PAGE_URL);

        validateSafetyCheckAccess(req, res, next);

        expect(req.session.completedSteps).toContain(FORM_STEPS.START);
      });

      it('should allow access when referrer has query parameters', () => {
        (req.get as jest.Mock).mockReturnValue(`${GDS_START_PAGE_URL}?utm_source=test`);

        validateSafetyCheckAccess(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
      });
    });

    describe('when user has already completed START step', () => {
      it('should allow access and call next', () => {
        req.session.completedSteps = [FORM_STEPS.START];
        (req.get as jest.Mock).mockReturnValue('');

        validateSafetyCheckAccess(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
      });
    });

    describe('when user tries to bypass GDS', () => {
      it('should redirect to GDS start page when no referrer', () => {
        (req.get as jest.Mock).mockReturnValue('');

        validateSafetyCheckAccess(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(GDS_START_PAGE_URL);
        expect(next).not.toHaveBeenCalled();
      });

      it('should redirect to GDS start page when referrer is from different domain', () => {
        (req.get as jest.Mock).mockReturnValue('https://example.com/some-page');

        validateSafetyCheckAccess(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(GDS_START_PAGE_URL);
        expect(next).not.toHaveBeenCalled();
      });

      it('should redirect to GDS start page when referrer is from different gov.uk page', () => {
        (req.get as jest.Mock).mockReturnValue('https://www.gov.uk/different-page');

        validateSafetyCheckAccess(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(GDS_START_PAGE_URL);
        expect(next).not.toHaveBeenCalled();
      });

      it('should redirect when user types URL directly (no referrer, no session)', () => {
        req.session.completedSteps = [];
        (req.get as jest.Mock).mockReturnValue('');

        validateSafetyCheckAccess(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith(GDS_START_PAGE_URL);
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Development mode', () => {
    beforeEach(() => {
      (config as { production: boolean }).production = false;
    });

    it('should allow direct access without referrer', () => {
      (req.get as jest.Mock).mockReturnValue('');

      validateSafetyCheckAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should mark START step as completed', () => {
      (req.get as jest.Mock).mockReturnValue('');

      validateSafetyCheckAccess(req, res, next);

      expect(req.session.completedSteps).toContain(FORM_STEPS.START);
    });

    it('should allow access when referrer is from localhost', () => {
      (req.get as jest.Mock).mockReturnValue('http://localhost:8001/');

      validateSafetyCheckAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should still allow access from GDS referrer', () => {
      (req.get as jest.Mock).mockReturnValue(GDS_START_PAGE_URL);

      validateSafetyCheckAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing completedSteps array and initialise it', () => {
      req.session.completedSteps = undefined;
      (config as { production: boolean }).production = false;

      validateSafetyCheckAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.session.completedSteps).toContain(FORM_STEPS.START);
    });

    it('should handle null referrer header', () => {
      (req.get as jest.Mock).mockReturnValue(null);
      (config as { production: boolean }).production = false;

      validateSafetyCheckAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should not duplicate START step if already present', () => {
      req.session.completedSteps = [FORM_STEPS.START];
      (req.get as jest.Mock).mockReturnValue(GDS_START_PAGE_URL);

      validateSafetyCheckAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.session.completedSteps.filter((s: string) => s === FORM_STEPS.START)).toHaveLength(1);
    });
  });
});
