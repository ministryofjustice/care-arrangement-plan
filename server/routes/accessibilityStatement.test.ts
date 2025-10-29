import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import logger from '../logger';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(paths.ACCESSIBILITY_STATEMENT, () => {
  describe('GET', () => {
    it('should render accessibility statement page', async () => {
      logger.info(`GET ${paths.ACCESSIBILITY_STATEMENT}`);
      const response = await request(app).get(paths.ACCESSIBILITY_STATEMENT).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Accessibility statement');
    });
  });
});
