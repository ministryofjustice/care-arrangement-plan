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
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'primaryError';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.PLAN_LONG_TERM_NOTICE}`,
          type: 'field',
        },
      ]);
      const dom = new JSDOM((await request(app).get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)).text);

      expect(dom.window.document.querySelector(`#${formFields.PLAN_LONG_TERM_NOTICE}-error`)).toHaveTextContent(
        primaryError,
      );
    });

    it('should render previous values correctly', async () => {
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
    });

    it(`should redirect to ${paths.DECISION_MAKING_PLAN_REVIEW} when the answer is entered and set values in the session`, async () => {
      const description = 'description';

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
        .send({
          [formFields.PLAN_LONG_TERM_NOTICE]: 'anotherArrangement',
          [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: description,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

      expect(sessionMock.decisionMaking.planLongTermNotice).toEqual({
        otherAnswer: description,
        noDecisionRequired: false,
      });
    });

    it(`must have description if anotherArrangement is set`, async () => {
      const options = 'anotherArrangement';

      await request(app)
        .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
        .send({
          [formFields.PLAN_LONG_TERM_NOTICE]: options,
        })
        .expect(302)
        .expect('location', paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);

      expect(sessionMock.decisionMaking?.planLongTermNotice).toBeUndefined();
    });
  });

  it('should render plan review and set session values', async () => {
    const answer = 'response';

    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE)
      .send({
        [formFields.PLAN_LONG_TERM_NOTICE]: 'anotherArrangement',
        [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: answer,
      })
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

    expect(sessionMock.decisionMaking.planLongTermNotice).toEqual({ noDecisionRequired: false, otherAnswer: answer });
  });
});

describe(`POST ${paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE_CHANGES_NOT_REQUIRED}`, () => {
  it('should redirect to items for changeover when the answer is entered and set session values', async () => {
    await request(app)
      .post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE_CHANGES_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.DECISION_MAKING_PLAN_REVIEW);

    expect(sessionMock.decisionMaking.planLongTermNotice).toEqual({ noDecisionRequired: true });
  });
});
