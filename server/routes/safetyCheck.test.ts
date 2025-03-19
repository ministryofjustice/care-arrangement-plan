import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashMock, flashMockErrors } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.SAFETY_CHECK, () => {
  describe('GET', () => {
    it('should render safety check page', async () => {
      const response = await request(app).get(paths.SAFETY_CHECK).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Safety check');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby');
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.SAFETY_CHECK,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.SAFETY_CHECK)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.SAFETY_CHECK}-error`,
      );
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app).post(paths.SAFETY_CHECK).expect(302).expect('location', paths.SAFETY_CHECK);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.SAFETY_CHECK,
          type: 'field',
        },
      ]);
    });

    it('should redirect to children safety check page if the answer is yes', () => {
      return request(app)
        .post(paths.SAFETY_CHECK)
        .send({ [formFields.SAFETY_CHECK]: 'Yes' })
        .expect(302)
        .expect('location', paths.CHILDREN_SAFETY_CHECK);
    });

    it('should redirect to not safe page if the answer is no', () => {
      return request(app)
        .post(paths.SAFETY_CHECK)
        .send({ [formFields.SAFETY_CHECK]: 'No' })
        .expect(302)
        .expect('location', paths.NOT_SAFE);
    });
  });
});

describe(`GET ${paths.NOT_SAFE}`, () => {
  it('should render not safe page', () => {
    return request(app)
      .get(paths.NOT_SAFE)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Finding the right route for you');
      });
  });
});
