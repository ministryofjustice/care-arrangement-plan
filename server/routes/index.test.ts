import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(`GET ${paths.START}`, () => {
  it('should render index page', () => {
    return request(app)
      .get(paths.START)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Propose a child arrangements plan');
      });
  });
});
