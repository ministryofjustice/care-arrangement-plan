import { JSDOM } from 'jsdom';
import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(paths.ACCESSIBILITY_STATEMENT, () => {
  describe('GET', () => {
    it('should render accessibility statement page', async () => {
      config.analytics.ga4Id = undefined;

      const response = await request(app).get(paths.ACCESSIBILITY_STATEMENT).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Accessibility statement');
    });
  });
});
