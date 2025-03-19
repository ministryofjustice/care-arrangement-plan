import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(paths.TERMS_AND_CONDITIONS, () => {
  describe('GET', () => {
    it('should render terms and conditions page', async () => {
      const response = await request(app).get(paths.TERMS_AND_CONDITIONS).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Terms and conditions');
    });
  });
});
