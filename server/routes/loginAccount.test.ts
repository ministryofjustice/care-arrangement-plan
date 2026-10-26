import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(paths.LOGIN_ACCOUNT, () => {
  describe('GET', () => {
    it('should render the login account page', async () => {
      const response = await request(app).get(paths.LOGIN_ACCOUNT).expect(200).expect('Content-Type', /html/);

      const { document } = new JSDOM(response.text).window;

      expect(document.querySelector('h1')).toHaveTextContent('Your child arrangements plans');
      expect(document.body).toHaveTextContent('Create and manage child arrangements plans for your children.');
      expect(document.querySelector(`form[action="${paths.LOGIN_START}"] button`)).toHaveTextContent(
        'Create a new plan',
      );
    });

    it('should render the saved plan and its actions', async () => {
      const response = await request(app).get(paths.LOGIN_ACCOUNT).expect(200);

      const { document } = new JSDOM(response.text).window;

      expect(document.body).toHaveTextContent('Jason and Amelia');
      expect(document.body).toHaveTextContent('Harrison and Jennifer');
      expect(document.body).toHaveTextContent('In progress');
      expect(document.body).toHaveTextContent('23 October 2026');
      expect(document.body).toHaveTextContent('Continue plan');
      expect(document.body).toHaveTextContent('Delete this plan');
    });
  });
});
