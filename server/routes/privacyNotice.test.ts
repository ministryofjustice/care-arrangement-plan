import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(paths.PRIVACY_NOTICE, () => {
  describe('GET', () => {
    it('should render privacy notice page', async () => {
      const response = await request(app).get(paths.CONTACT_US).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Privacy notice');
    });
  });
});
