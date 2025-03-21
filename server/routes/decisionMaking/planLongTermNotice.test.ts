import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE, () => {
  describe('GET', () => {
    it('should render plan long term notice page', async () => {
      const response = await request(app)
        .get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'How much notice should you give to change long-term arrangements?',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector('fieldset').getAttribute('aria-describedby')).not.toContain(
        `${formFields.PLAN_LONG_TERM_NOTICE}-error`,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}`),
      ).not.toHaveAttribute('aria-describedby');
      expect(dom.window.document.querySelector(':checked')).toBeNull();
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'primaryError';
      const textError = 'textError';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.PLAN_LONG_TERM_NOTICE}`,
          type: 'field',
        },
        {
          location: 'body',
          msg: textError,
          path: `${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}`,
          type: 'field',
        },
      ]);
      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.PLAN_LONG_TERM_NOTICE}-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE}-error`)).toHaveTextContent(
        primaryError,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}`),
      ).toHaveAttribute('aria-describedby', `${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}-error`);
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}-error`),
      ).toHaveTextContent(textError);
    });

    it('should render field value flash responses correctly with other arrangement', async () => {
      const arrangement = 'arrangement';
      Object.assign(flashFormValues, [
        {
          [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: arrangement,
          [formFields.PLAN_LONG_TERM_NOTICE]: ['anotherArrangement'],
        },
      ]);

      sessionMock.decisionMaking = {
        planLongTermNotice: {
          weeks: 2,
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(arrangement);
    });

    it('should render field value flash responses correctly with specified arrangements', async () => {
      Object.assign(flashFormValues, [
        {
          [formFields.PLAN_LONG_TERM_NOTICE]: 2,
        },
      ]);

      sessionMock.decisionMaking = {
        planLongTermNotice: {
          otherAnswer: 'description',
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE}`)).toBeChecked();
    });

    it('should render previous values correctly for other arrangement', async () => {
      const description = 'My description';

      sessionMock.decisionMaking = {
        planLongTermNotice: {
          otherAnswer: description,
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(description);
    });

    it('should render previous values correctly for weeks', async () => {
      sessionMock.decisionMaking = {
        planLongTermNotice: {
          weeks: 2,
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE}`)).toBeChecked();
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select at least one option',
          path: formFields.PLAN_LONG_TERM_NOTICE,
          type: 'field',
          value: undefined,
        },
      ]);
    });

    it('should reload page and set flash when another arrangement is selected but no description is set', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
        .send({
          [formFields.PLAN_LONG_TERM_NOTICE]: 'anotherArrangement',
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe what is the other arrangement you are proposing',
          path: formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT,
          type: 'field',
          value: '',
        },
      ]);

      expect(sessionMock.decisionMaking?.planLongTermNotice).toBeUndefined();
    });

    it(`should redirect to ${paths.DECISION_MAKING_PLAN_REVIEW} when the answer is entered and set values in the session for another arrangement`, async () => {
      const initialDecisionMaking = { planLastMinuteChanges: { noDecisionRequired: true } };
      sessionMock.decisionMaking = initialDecisionMaking;
      const description = 'description';

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
        .send({
          [formFields.PLAN_LONG_TERM_NOTICE]: 'anotherArrangement',
          [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: description,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

      expect(sessionMock.decisionMaking).toEqual({
        ...initialDecisionMaking,
        planLongTermNotice: {
          otherAnswer: description,
          noDecisionRequired: false,
        },
      });
    });
  });

  it('should render plan review and set session values for weeks', async () => {
    const initialDecisionMaking = { planLastMinuteChanges: { noDecisionRequired: true } };
    sessionMock.decisionMaking = initialDecisionMaking;

    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
      .send({
        [formFields.PLAN_LONG_TERM_NOTICE]: '2',
      })
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

    expect(sessionMock.decisionMaking).toEqual({
      ...initialDecisionMaking,
      planLongTermNotice: { noDecisionRequired: false, weeks: 2 },
    });
  });
});

describe(`POST ${paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE_CHANGES_NOT_REQUIRED}`, () => {
  it('should redirect to items for changeover when the answer is entered and set session values', async () => {
    const initialDecisionMaking = { planLastMinuteChanges: { noDecisionRequired: true } };
    sessionMock.decisionMaking = initialDecisionMaking;

    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE_CHANGES_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

    expect(sessionMock.decisionMaking).toEqual({
      ...initialDecisionMaking,
      planLongTermNotice: { noDecisionRequired: true },
    });
  });
});
