import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.ABOUT_THE_ADULTS, () => {
  describe('GET', () => {
    it('should render about the adults page', async () => {
      const response = await request(app).get(paths.ABOUT_THE_ADULTS).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'About the adults who will care for the children',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(
        dom.window.document.querySelector(`#${formFields.INITIAL_ADULT_NAME}`).getAttribute('aria-describedby'),
      ).not.toContain(`${formFields.INITIAL_ADULT_NAME}-error`);
      expect(dom.window.document.querySelector(`#${formFields.SECONDARY_ADULT_NAME}`)).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne';
      const secondaryError = 'errorTwo';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: formFields.INITIAL_ADULT_NAME,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: formFields.SECONDARY_ADULT_NAME,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.ABOUT_THE_ADULTS)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.INITIAL_ADULT_NAME}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.INITIAL_ADULT_NAME}-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.INITIAL_ADULT_NAME}-error`)).toHaveTextContent(
        primaryError,
      );
      expect(dom.window.document.querySelector(`#${formFields.SECONDARY_ADULT_NAME}`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.SECONDARY_ADULT_NAME}-error`,
      );
      expect(dom.window.document.querySelector(`#${formFields.SECONDARY_ADULT_NAME}-error`)).toHaveTextContent(
        secondaryError,
      );
    });

    it('should render field value flash responses correctly', async () => {
      const initialName = 'initialName';
      const secondaryName = 'secondaryName';
      Object.assign(flashFormValues, [
        { [formFields.INITIAL_ADULT_NAME]: initialName, [formFields.SECONDARY_ADULT_NAME]: secondaryName },
      ]);

      sessionMock.initialAdultName = 'wrong initialName';
      sessionMock.secondaryAdultName = 'wrong secondaryName';

      const dom = new JSDOM((await request(app).get(paths.ABOUT_THE_ADULTS)).text);

      expect(dom.window.document.querySelector(`#${formFields.INITIAL_ADULT_NAME}`)).toHaveValue(initialName);
      expect(dom.window.document.querySelector(`#${formFields.SECONDARY_ADULT_NAME}`)).toHaveValue(secondaryName);
    });

    it('should render field previous values correctly', async () => {
      const initialName = 'initialName';
      const secondaryName = 'secondaryName';

      sessionMock.initialAdultName = initialName;
      sessionMock.secondaryAdultName = secondaryName;

      const dom = new JSDOM((await request(app).get(paths.ABOUT_THE_ADULTS)).text);

      expect(dom.window.document.querySelector(`#${formFields.INITIAL_ADULT_NAME}`)).toHaveValue(initialName);
      expect(dom.window.document.querySelector(`#${formFields.SECONDARY_ADULT_NAME}`)).toHaveValue(secondaryName);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when the page is not correctly filled', async () => {
      const initialName = 'initialName';
      await request(app)
        .post(paths.ABOUT_THE_ADULTS)
        .send({ [formFields.INITIAL_ADULT_NAME]: initialName })
        .expect(302)
        .expect('location', paths.ABOUT_THE_ADULTS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Enter the name of the other parent or carer',
          path: formFields.SECONDARY_ADULT_NAME,
          type: 'field',
          value: '',
        },
      ]);
      expect(flashMock).toHaveBeenCalledWith('formValues', {
        [formFields.INITIAL_ADULT_NAME]: initialName,
        [formFields.SECONDARY_ADULT_NAME]: '',
      });
    });

    it('should redirect to task list page if the page is correctly filled', async () => {
      const initialName = 'initialName';
      const secondaryName = 'secondaryName';
      await request(app)
        .post(paths.ABOUT_THE_ADULTS)
        .send({ [formFields.INITIAL_ADULT_NAME]: initialName, [formFields.SECONDARY_ADULT_NAME]: secondaryName })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.initialAdultName).toEqual(initialName);
      expect(sessionMock.secondaryAdultName).toEqual(secondaryName);
    });
  });
});
