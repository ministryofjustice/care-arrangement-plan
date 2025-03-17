import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashMock, flashMockErrors } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.DO_WHATS_BEST, () => {
  describe('GET', () => {
    it('should render do whats best page', async () => {
      const response = await request(app).get(paths.DO_WHATS_BEST).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('What’s best for the children?');
      expect(dom.window.document.querySelector('h2')).toBeNull();
      expect(dom.window.document.querySelector(`#${formFields.DO_WHATS_BEST}`)).not.toHaveAttribute('aria-describedby');
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.DO_WHATS_BEST,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.DO_WHATS_BEST)).text);

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem');
      expect(dom.window.document.querySelector(`#${formFields.DO_WHATS_BEST}`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.DO_WHATS_BEST}-error`,
      );
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app).post(paths.DO_WHATS_BEST).expect(302).expect('location', paths.DO_WHATS_BEST);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.DO_WHATS_BEST,
          type: 'field',
        },
      ]);
    });

    it('should redirect to court order check page if the box is checked', () => {
      return request(app)
        .post(paths.DO_WHATS_BEST)
        .send({ [formFields.DO_WHATS_BEST]: '' })
        .expect(302)
        .expect('location', paths.COURT_ORDER_CHECK);
    });
  });
});
