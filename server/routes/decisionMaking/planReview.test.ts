import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

beforeEach(() => {
  sessionMock.livingAndVisiting = {
    mostlyLive: {
      where: 'split',
    },
    daytimeVisits: {
      willHappen: true,
    },
  };
});

describe(paths.DECISION_MAKING_PLAN_REVIEW, () => {
  describe('GET', () => {
    it('should render plan review page', async () => {
      const response = await request(app).get(paths.DECISION_MAKING_PLAN_REVIEW).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('When will the children’s needs change?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
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

      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_MONTHS}-error`)).toHaveTextContent(
        monthError,
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_REVIEW_YEARS}-error`)).toHaveTextContent(yearError);
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

    it('should set flash when both month and year is filled', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_MONTHS]: 1,
          [formFields.PLAN_REVIEW_YEARS]: 1,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Enter months or years, not both',
          path: formFields.PLAN_REVIEW_MONTHS,
          type: 'field',
          value: '1',
        },
        {
          location: 'body',
          msg: 'Enter months or years, not both',
          path: formFields.PLAN_REVIEW_YEARS,
          type: 'field',
          value: '1',
        },
      ]);
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
      const months = 4;

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_MONTHS]: months,
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.decisionMaking.planReview).toEqual({
        months: 4,
      });
    });

    it(`should redirect to ${paths.TASK_LIST} when the year is entered and set values in the session`, async () => {
      const years = 4;

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_REVIEW)
        .send({
          [formFields.PLAN_REVIEW_YEARS]: years,
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.decisionMaking.planReview).toEqual({
        years: 4,
      });
    });
  });
});
