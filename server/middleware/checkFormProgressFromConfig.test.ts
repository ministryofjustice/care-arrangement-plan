import logger from '../logging/logger';

import { checkFormProgressFromConfig } from './checkFormProgressFromConfig';

jest.mock('../config/flowConfig', () => ({
  TASK_FLOW_MAP: {
    step1: { path: '/' },
    step2: { dependsOn: ['step1'], path: '/step2' },
  },
}));

jest.unmock('../middleware/checkFormProgressFromConfig');

describe('checkFormProgressFromConfig middleware', () => {

  test('redirects to start when current step key is not in TASK_FLOW_MAP and logs an error', () => {
    const req = { session: {}, path: '/somewhere' };
    const res = { redirect: jest.fn() };

    const middleware = checkFormProgressFromConfig('nonexistent');

    middleware(req, res, jest.fn());      
    expect(404),
    expect((res: { text: string; }) => {
        expect(res.text).toContain('Page not found');
    });

    expect((logger.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  test('calls next when required steps are completed', () => {
    const req = { session: { completedSteps: ['step1'] }, path: '/step2' };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    const middleware = checkFormProgressFromConfig('step2');

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test('redirects to start when required steps are missing and logs info', () => {
    const req = { session: { completedSteps: [] }, path: '/step2' } as object;
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    const middleware = checkFormProgressFromConfig('step2');

    middleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
    expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });
});
