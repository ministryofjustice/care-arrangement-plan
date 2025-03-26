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
  };
});

describe(paths.LIVING_VISITING_WHICH_SCHEDULE, () => {
  describe('GET', () => {
    it('should render which schedule page', async () => {
      const response = await request(app).get(paths.LIVING_VISITING_WHICH_SCHEDULE).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        "Which schedule best meets the children's needs?",
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(
        dom.window.document.querySelector(`#${formFields.WHICH_SCHEDULE}`).getAttribute('aria-describedby'),
      ).not.toContain(`${formFields.WHICH_SCHEDULE}-error`);
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WHICH_SCHEDULE,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_SCHEDULE)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.WHICH_SCHEDULE}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.WHICH_SCHEDULE}-error`),
      );
    });

    it('should render existing values correctly', async () => {
      const response = 'Alternating weeks';

      sessionMock.livingAndVisiting = {
        whichSchedule: {
          noDecisionRequired: false,
          answer: response,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_SCHEDULE)).text);

      expect(dom.window.document.querySelector(`#${formFields.WHICH_SCHEDULE}`)).toHaveValue(response);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WHICH_SCHEDULE)
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_SCHEDULE);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: "Describe which schedule will best meet the children's needs",
          path: formFields.WHICH_SCHEDULE,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
      const response = 'Alternating weeks';

      await request(app)
        .post(paths.LIVING_VISITING_WHICH_SCHEDULE)
        .send({ [formFields.WHICH_SCHEDULE]: response })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.livingAndVisiting).toEqual({
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: response,
        },
      });
    });
  });
});

describe(`POST ${paths.LIVING_VISITING_WHICH_SCHEDULE_NOT_REQUIRED}`, () => {
  it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
    await request(app)
      .post(paths.LIVING_VISITING_WHICH_SCHEDULE_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(sessionMock.livingAndVisiting).toEqual({
      mostlyLive: {
        where: 'split',
      },
      whichSchedule: {
        noDecisionRequired: true,
      },
    });
  });
});
