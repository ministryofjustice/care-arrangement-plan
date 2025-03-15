import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.COURT_ORDER_CHECK, () => {
  describe('GET', () => {
    it('should render court order check page', async () => {
      const response = await request(app).get(paths.COURT_ORDER_CHECK).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'Do you already have a court order in place about your child arrangements?',
      );
      expect(dom.window.document.querySelector('h2')).toBeNull();
      expect(dom.window.document.querySelector('fieldset').getAttribute('aria-describedby')).not.toContain(
        `${formFields.COURT_ORDER_CHECK}-error`,
      );
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.COURT_ORDER_CHECK,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.COURT_ORDER_CHECK)).text);

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem');
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.COURT_ORDER_CHECK}-error`),
      );
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app).post(paths.COURT_ORDER_CHECK).expect(302).expect('location', paths.COURT_ORDER_CHECK);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.COURT_ORDER_CHECK,
          type: 'field',
        },
      ]);
    });

    it('should redirect to existing court order page if the answer is yes', async () => {
      await request(app)
        .post(paths.COURT_ORDER_CHECK)
        .send({ [formFields.COURT_ORDER_CHECK]: 'Yes' })
        .expect(302)
        .expect('location', paths.EXISTING_COURT_ORDER);

      expect(sessionMock.courtOrderInPlace).toBe(true);
    });

    it('should redirect to number of children page if the answer is no', async () => {
      await request(app)
        .post(paths.COURT_ORDER_CHECK)
        .send({ [formFields.COURT_ORDER_CHECK]: 'No' })
        .expect(302)
        .expect('location', paths.NUMBER_OF_CHILDREN);

      expect(sessionMock.courtOrderInPlace).toBe(false);
    });
  });
});
