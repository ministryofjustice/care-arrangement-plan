import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

describe('sessionTimedOut route', () => {
  it('should render the session timeout page', async () => {
    await request(testAppSetup())
      .get(paths.SESSION_TIMED_OUT)
      .expect(403)
      .expect('Content-Type', /html/)
      .expect((res) => {
        expect(res.text).toContain('Your session automatically ends if you don’t use the service for 30 minutes.');
      });
  });
});
