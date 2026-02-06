import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.DECISION_MAKING_PLAN_REVIEW, () => {
  describe('GET', () => {
    it('should render plan review page', async () => {
      const response = await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('When will the children’s needs change?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}`)).not.toHaveAttribute(
        'aria-describedby',
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}`)).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('should render error flash responses correctly', async () => {
      const monthError = 'monthError';
      const yearError = 'yearError';

      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: monthError,
          path: `${formFields.PLAN_REVIEW_MONTHS}`,
          type: 'field',
        },
        {
          location: 'body',
          msg: yearError,
          path: `${formFields.PLAN_REVIEW_YEARS}`,
          type: 'field',
        },
      ]);
      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.PLAN_REVIEW_MONTHS}-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}-error`)).toHaveTextContent(
        monthError,
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.PLAN_REVIEW_YEARS}-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}-error`)).toHaveTextContent(yearError);
    });

    it('should render flash month correctly', async () => {
      const testValue = 4;

      Object.assign(flashFormValues, [
        {
          [formFields.PLAN_REVIEW_MONTHS]: testValue,
        },
      ]);

      sessionMock.decisionMaking = {
        planReview: {
          months: 6,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}`)).toHaveValue('');
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}`)).toHaveValue(testValue.toString());
    });

    it('should render flash year correctly', async () => {
      const testValue = 4;

      Object.assign(flashFormValues, [
        {
          [formFields.PLAN_REVIEW_YEARS]: testValue,
        },
      ]);

      sessionMock.decisionMaking = {
        planReview: {
          years: 6,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}`)).toHaveValue('');
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}`)).toHaveValue(testValue.toString());
    });
    it('should render previous month correctly', async () => {
      const testValue = 4;
      sessionMock.decisionMaking = {
        planReview: {
          months: testValue,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}`)).toHaveValue('');
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}`)).toHaveValue(testValue.toString());
    });

    it('should render previous year correctly', async () => {
      const testValue = 4;
      sessionMock.decisionMaking = {
        planReview: {
          years: testValue,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}`)).toHaveValue('');
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}`)).toHaveValue(testValue.toString());
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Enter months or years',
          path: formFields.PLAN_REVIEW_MONTHS,
          type: 'field',
          value: '',
        },
        {
          location: 'body',
          msg: 'Enter months or years',
          path: formFields.PLAN_REVIEW_YEARS,
          type: 'field',
          value: '',
        },
      ]);
    });

    it(`should redirect to ${paths.TASK_LIST} when both month and year are entered and set values in the session`, async () => {
      const initialDecisionMaking = { planLongTermNotice: { noDecisionRequired: true } };
      sessionMock.decisionMaking = initialDecisionMaking;
      const months = 6;
      const years = 0;

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_MONTHS]: months,
          [formFields.PLAN_REVIEW_YEARS]: years,
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.decisionMaking).toEqual({
        ...initialDecisionMaking,
        planReview: {
          months,
          years,
        },
      });
    });

    it('should set flash when month not numeric', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_MONTHS]: 'abc',
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Your answer must be a number',
          path: formFields.PLAN_REVIEW_MONTHS,
          type: 'field',
          value: 'abc',
        },
      ]);
    });

    it('should set flash when year not int', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_YEARS]: 1.4,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Your answer must be a whole number. For example, 3.',
          path: formFields.PLAN_REVIEW_YEARS,
          type: 'field',
          value: '1.4',
        },
      ]);
    });

    it(`should redirect to ${paths.TASK_LIST} when the month is entered and set values in the session`, async () => {
      const initialDecisionMaking = { planLongTermNotice: { noDecisionRequired: true } };
      sessionMock.decisionMaking = initialDecisionMaking;
      const months = 4;

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_MONTHS]: months,
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.decisionMaking).toEqual({
        ...initialDecisionMaking,
        planReview: {
          months,
        },
      });
    });

    it(`should redirect to ${paths.TASK_LIST} when the year is entered and set values in the session`, async () => {
      const initialDecisionMaking = { planLongTermNotice: { noDecisionRequired: true } };
      sessionMock.decisionMaking = initialDecisionMaking;
      const years = 4;

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_YEARS]: years,
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.decisionMaking).toEqual({
        ...initialDecisionMaking,
        planReview: {
          years,
        },
      });
    });
  });
});
