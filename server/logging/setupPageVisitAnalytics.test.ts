import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import * as analyticsService from '../services/analyticsService';
import testAppSetup from '../test-utils/testAppSetup';


jest.mock('../services/analyticsService', () => ({
  logPageVisit: jest.fn(),
}));

const app = testAppSetup();


describe('setupPageVisitAnalytics Middleware', () => {
  beforeEach(() => {
    (analyticsService.logPageVisit as jest.Mock).mockClear();
  });

  it('should log a page_visit event for a successful GET request', async () => {
    await request(app).get('/').expect(200);

    expect(analyticsService.logPageVisit).toHaveBeenCalledTimes(1);
  });

  it('should NOT log requests to excluded paths like /health', async () => {
    await request(app).get('/health').expect(200);

    expect(analyticsService.logPageVisit).not.toHaveBeenCalled();
  });

  it('should NOT log requests to excluded patterns like /rebrand/', async () => {
    await request(app).get('/rebrand/images/favicon.svg').expect(404);

    expect(analyticsService.logPageVisit).not.toHaveBeenCalled();
  });

  it('should NOT log non-GET requests or requests with a 4xx/5xx status code', async () => {
    await request(app).post(paths.SAFETY_CHECK).send({ [formFields.SAFETY_CHECK]: 'Yes' }).expect(302);
    await request(app).get('/not-found').expect(404);

    expect(analyticsService.logPageVisit).not.toHaveBeenCalled();
  });

});
