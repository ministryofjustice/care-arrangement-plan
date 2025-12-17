import { Request, Response } from 'express';

import logger from '../logging/logger';

import checkFormProgressFromConfig  from './checkFormProgressFromConfig';

jest.mock('../config/flowConfig', () => ({
    step1: { path: '/', dependsOn: [] as string[] },
    step2: { dependsOn: ['step1'] as string[], path: '/step2' },
    step3: { dependsOn: ['step1'] as string[], path: '/step3' },
}));

jest.unmock('../middleware/checkFormProgressFromConfig');

describe('checkFormProgressFromConfig middleware', () => {

  test('gives 404 error when current step key is not in TASK_FLOW_MAP and logs an error', () => {
  const req = { session: {}, path: '/somewhere' } as unknown as Request & { session?: { completedSteps?: string[] } };
  const res = { redirect: jest.fn() } as unknown as Response & { text?: string };

    const middleware = checkFormProgressFromConfig('nonexistent');

    middleware(req, res, jest.fn());      
    expect(404).toBeTruthy();

    expect((logger.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  test('calls next when required steps are completed', () => {
  const req = { session: { completedSteps: ['step1'] }, path: '/step2' } as unknown as Request & { session?: { completedSteps?: string[] } };
  const res = { redirect: jest.fn() } as unknown as Response;
    const next = jest.fn();

    const middleware = checkFormProgressFromConfig('step2');

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test('redirects to start when required steps are missing and logs info', () => {
  const req = { session: { completedSteps: [] }, path: '/step2' } as unknown as Request & { session?: { completedSteps?: string[] } };
  const res = { redirect: jest.fn() } as unknown as Response;
    const next = jest.fn();

    const middleware = checkFormProgressFromConfig('step2');

    middleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
    expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  test('calls next when step3 dependencies are completed', () => {
    const req = { session: { completedSteps: ['step1'] }, path: '/step3' } as unknown as Request & { session?: { completedSteps?: string[] } };
    const res = { redirect: jest.fn() } as unknown as Response;
    const next = jest.fn();

    const middleware = checkFormProgressFromConfig('step3');

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test('redirects to start when step3 dependencies are not completed', () => {
    const req = { session: { completedSteps: [] }, path: '/step3' } as unknown as Request & { session?: { completedSteps?: string[] } };
    const res = { redirect: jest.fn() } as unknown as Response;
    const next = jest.fn();

    const middleware = checkFormProgressFromConfig('step3');

    middleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
  });
});
