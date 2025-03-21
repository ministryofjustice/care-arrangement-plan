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
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.PLAN_LAST_MINUTE_CHANGES}`,
          type: 'field',
        },
      ]);
      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-error`)).toHaveTextContent(
        primaryError,
      );
    });

    it('should render previous values correctly', async () => {
      const description = 'My description';

      sessionMock.decisionMaking = {
        planLastMinuteChanges: {
          options: ['anotherArrangement'],
          anotherArrangmentDescription: description,
          noDecisionRequired: false,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(description);
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
        {
          location: 'body',
          msg: 'Describe how you will communicate changes',
          path: 'plan-last-minute-changes-describe-arrangement',
          type: 'field',
          value: '',
        },
      ]);
    });

    it(`should redirect to ${paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES} when the answer is entered and set values in the session`, async () => {
      const description = 'description';

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .send({
          [formFields.PLAN_LAST_MINUTE_CHANGES]: 'anotherArrangement',
          [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: description,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(sessionMock.decisionMaking.planLastMinuteChanges).toEqual({
        options: ['anotherArrangement'],
        anotherArrangmentDescription: description,
        noDecisionRequired: false,
      });
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
    });

    it(`should allow multiple options`, async () => {
      const options = ['byText', 'byPhone'];

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .send({
          [formFields.PLAN_LAST_MINUTE_CHANGES]: options,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(sessionMock.decisionMaking.planLastMinuteChanges).toEqual({
        options: options,
        noDecisionRequired: false,
      });
    });

    it(`should not allow multiple options with another arranggemnt`, async () => {
      const options = ['byText', 'anotherArrangement'];

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES)
        .send({
          [formFields.PLAN_LAST_MINUTE_CHANGES]: options,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);
    });
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
  });
});

describe(`POST ${paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES_NOT_REQUIRED}`, () => {
  it('should redirect to items for changeover when the answer is entered and set session values', async () => {
    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

    expect(sessionMock.decisionMaking.planLastMinuteChanges).toEqual({ noDecisionRequired: true });
  });
});
