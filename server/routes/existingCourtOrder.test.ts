import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(`GET ${paths.EXISTING_COURT_ORDER}`, () => {
  it('should render existing court order page', () => {
    return request(app)
      .get(paths.EXISTING_COURT_ORDER)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Do not continue');
      });
  });
});
