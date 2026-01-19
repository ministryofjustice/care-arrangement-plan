import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(`GET ${paths.START}`, () => {
  it('should render index page in non-production', () => {
    return request(app)
      .get(paths.START)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Propose a child arrangements plan');
      });
  });

  it('should redirect to safety check in production', async () => {
    const originalProduction = config.production;
    Object.defineProperty(config, 'production', { value: true, writable: true });

    try {
      await request(app)
        .get(paths.START)
        .expect(302)
        .expect('Location', paths.SAFETY_CHECK);
    } finally {
      Object.defineProperty(config, 'production', { value: originalProduction, writable: true });
    }
  });
});
