import type { Request, Response } from 'express';

import logger from '../logging/logger';

import checkFormProgressFromConfig  from './checkFormProgressFromConfig';

jest.mock('../config/flowConfig', () => ({
  step1: { path: '/step1', dependsOn: [] as string[] },
  step2: { dependsOn: ['step1'] as string[], path: '/step2' },
  step3: { dependsOn: ['step1', 'step2'] as string[], path: '/step3' },
  step4: { dependsOn: ['step1', 'step2', 'step3'] as string[], path: '/step4' },
}));

jest.unmock('../middleware/checkFormProgressFromConfig');

describe('checkFormProgressFromConfig middleware', () => {
  let req: Request & { path: string };
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: {},
      path: '/test',
      flash: jest.fn(),
    } as unknown as Request & { path: string };
    res = {
      redirect: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Error handling', () => {
    test('throws 404 error when current step key is not in TASK_FLOW_MAP and logs an error', () => {
      expect(() => {
        checkFormProgressFromConfig('nonexistent');
      }).toThrow();

      expect((logger.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 1: Prerequisites met', () => {
    test('calls next when required steps are completed', () => {
      req.session.completedSteps = ['step1'];

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(req.flash).not.toHaveBeenCalled();
    });

    test('calls next when all multiple dependencies are completed', () => {
      req.session.completedSteps = ['step1', 'step2'];

      const middleware = checkFormProgressFromConfig('step3');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(req.flash).not.toHaveBeenCalled();
    });

    test('calls next when step has no dependencies', () => {
      req.session.completedSteps = [];

      const middleware = checkFormProgressFromConfig('step1');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 2: Fresh visitor (no journey started)', () => {
    test('silently redirects to start when completedSteps is empty and pageHistory is empty', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = [];

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    test('silently redirects to start when completedSteps is empty and pageHistory has only 1 entry', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = ['/test'];

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('silently redirects when accessing step3 without any progress', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = [];

      const middleware = checkFormProgressFromConfig('step3');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 3: POST failure (visited page but submission failed)', () => {
    test('redirects with "progress not saved" message when user has visited the redirect page before', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = ['/step1', '/step2'];
      req.path = '/step2';

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        'Your progress was not saved. Please submit this page to continue.'
      );
      expect(next).not.toHaveBeenCalled();
      expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    test('redirects with "progress not saved" when missing first of multiple required steps and has visited', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = ['/step1', '/step2', '/step3'];
      req.path = '/step3';

      const middleware = checkFormProgressFromConfig('step3');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        'Your progress was not saved. Please submit this page to continue.'
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('redirects with "progress not saved" when partially completed multi-dependency step and has visited', () => {
      req.session.completedSteps = ['step1'];
      req.session.pageHistory = ['/step1', '/step2', '/step3'];
      req.path = '/step3';

      const middleware = checkFormProgressFromConfig('step3');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step2');
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        'Your progress was not saved. Please submit this page to continue.'
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 4: Jumping ahead (skipped required steps)', () => {
    test('redirects with "complete this page" message when user jumped ahead without visiting missing page', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = ['/step3', '/step2'];
      req.path = '/step2';

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        'You need to complete this page before continuing.'
      );
      expect(next).not.toHaveBeenCalled();
      expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    test('redirects with "complete this page" when user has some progress but skipped a required step', () => {
      req.session.completedSteps = ['step1', 'step2'];
      req.session.pageHistory = ['/step1', '/step2', '/step4'];
      req.path = '/step4';

      const middleware = checkFormProgressFromConfig('step4');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step3');
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        'You need to complete this page before continuing.'
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('redirects to first missing step when multiple steps are missing', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = ['/step4', '/step3'];
      req.path = '/step3';

      const middleware = checkFormProgressFromConfig('step3');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        'You need to complete this page before continuing.'
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    test('handles missing session gracefully', () => {
      req.session = undefined;

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(next).not.toHaveBeenCalled();
    });

    test('handles missing completedSteps array', () => {
      req.session.completedSteps = undefined;
      req.session.pageHistory = [];

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(next).not.toHaveBeenCalled();
    });

    test('handles missing pageHistory array', () => {
      req.session.completedSteps = [];
      req.session.pageHistory = undefined;

      const middleware = checkFormProgressFromConfig('step2');
      middleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/step1');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
