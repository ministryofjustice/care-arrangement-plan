import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES, () => {
  describe('GET', () => {
    it('should render which plan last minute changes page', async () => {
      const response = await request(app)
        .get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'How should last-minute changes be communicated?',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset').getAttribute('aria-describedby')).not.toContain(
        `${formFields.PLAN_LAST_MINUTE_CHANGES}-error`,
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}`)).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'primaryError';
      const textError = 'textError';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.PLAN_LAST_MINUTE_CHANGES}`,
          type: 'field',
        },
        {
          location: 'body',
          msg: textError,
          path: `${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}`,
          type: 'field',
        },
      ]);
      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.PLAN_LAST_MINUTE_CHANGES}-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-error`)).toHaveTextContent(
        primaryError,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}`),
      ).toHaveAttribute('aria-describedby', `${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}-error`);
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}-error`),
      ).toHaveTextContent(textError);
    });

    it('should render field value flash responses correctly with other arrangement', async () => {
      const arrangement = 'arrangement';
      Object.assign(flashFormValues, [
        {
          [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: arrangement,
          [formFields.PLAN_LAST_MINUTE_CHANGES]: ['anotherArrangement'],
        },
      ]);

      sessionMock.decisionMaking = {
        planLastMinuteChanges: {
          options: ['text', 'phone', 'app'],
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(1);
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(arrangement);
    });

    it('should render field value flash responses correctly with specified arrangements', async () => {
      Object.assign(flashFormValues, [
        {
          [formFields.PLAN_LAST_MINUTE_CHANGES]: ['text', 'phone', 'app'],
        },
      ]);

      sessionMock.decisionMaking = {
        planLastMinuteChanges: {
          options: ['anotherArrangement'],
          anotherArrangementDescription: 'description',
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(3);
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-2`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-4`)).toBeChecked();
    });

    it('should render previous values correctly for other arrangement', async () => {
      const description = 'My description';

      sessionMock.decisionMaking = {
        planLastMinuteChanges: {
          options: ['anotherArrangement'],
          anotherArrangementDescription: description,
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(1);
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(description);
    });

    it('should render previous values correctly for specified arrangements', async () => {
      sessionMock.decisionMaking = {
        planLastMinuteChanges: {
          options: ['text', 'phone', 'app'],
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(3);
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-2`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-4`)).toBeChecked();
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select a method for how you both communicate changes',
          path: formFields.PLAN_LAST_MINUTE_CHANGES,
          type: 'field',
          value: undefined,
        },
      ]);
    });

    it(`should redirect to ${paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES} when the answer is entered and set values in the session`, async () => {
      const initialDecisionMaking = { planLongTermNotice: { noDecisionRequired: true } };
      sessionMock.decisionMaking = initialDecisionMaking;
      const description = 'description';

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .send({
          [formFields.PLAN_LAST_MINUTE_CHANGES]: 'anotherArrangement',
          [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: description,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(sessionMock.decisionMaking).toEqual({
        ...initialDecisionMaking,
        planLastMinuteChanges: {
          options: ['anotherArrangement'],
          anotherArrangementDescription: description,
          noDecisionRequired: false,
        },
      });
    });

    it(`should allow multiple options`, async () => {
      const initialDecisionMaking = { planLongTermNotice: { noDecisionRequired: true } };
      sessionMock.decisionMaking = initialDecisionMaking;

      const options = ['text', 'phone'];

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .send({
          [formFields.PLAN_LAST_MINUTE_CHANGES]: options,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(sessionMock.decisionMaking).toEqual({
        ...initialDecisionMaking,
        planLastMinuteChanges: {
          options: options,
          noDecisionRequired: false,
        },
      });
    });
  });

  it(`should not allow multiple options with another arrangement`, async () => {
    const options = ['text', 'anotherArrangement'];

    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
      .send({
        [formFields.PLAN_LAST_MINUTE_CHANGES]: options,
      })
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);

    expect(flashMock).toHaveBeenCalledWith('errors', [
      {
        location: 'body',
        msg: 'Describe what other arrangement you are proposing',
        path: formFields.PLAN_LAST_MINUTE_CHANGES,
        type: 'field',
        value: options,
      },
    ]);
  });

  it('should not allow no description set when another arrangement is selected', async () => {
    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
      .send({
        [formFields.PLAN_LAST_MINUTE_CHANGES]: 'anotherArrangement',
      })
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);

    expect(flashMock).toHaveBeenCalledWith('errors', [
      {
        location: 'body',
        msg: 'Describe how you will communicate changes',
        path: formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT,
        type: 'field',
        value: '',
      },
    ]);

    expect(sessionMock.decisionMaking?.planLastMinuteChanges).toBeUndefined();
  });
});

describe(`POST ${paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES_NOT_REQUIRED}`, () => {
  it('should redirect to items for changeover when the answer is entered and set session values', async () => {
    const initialDecisionMaking = { planLongTermNotice: { noDecisionRequired: true } };
    sessionMock.decisionMaking = initialDecisionMaking;

    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

    expect(sessionMock.decisionMaking).toEqual({
      ...initialDecisionMaking,
      planLastMinuteChanges: { noDecisionRequired: true },
    });
  });
});
