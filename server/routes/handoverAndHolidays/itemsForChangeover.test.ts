import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER, () => {
  describe('GET', () => {
    it('should render items for changeover page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('What items need to go between households?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(
        dom.window.document.querySelector(`#${formFields.ITEMS_FOR_CHANGEOVER}`).getAttribute('aria-describedby'),
      ).not.toContain(`${formFields.ITEMS_FOR_CHANGEOVER}-error`);
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.ITEMS_FOR_CHANGEOVER,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.ITEMS_FOR_CHANGEOVER}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.ITEMS_FOR_CHANGEOVER}-error`),
      );
    });

    it('should render existing values correctly', async () => {
      const response = 'response';

      sessionMock.handoverAndHolidays = {
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: response,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)).text);

      expect(dom.window.document.querySelector(`#${formFields.ITEMS_FOR_CHANGEOVER}`)).toHaveValue(response);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.ITEMS_FOR_CHANGEOVER,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to task list when the answer is entered and set itemsForChangeover', async () => {
      const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } };
      sessionMock.handoverAndHolidays = initialHandoverAndHolidays;
      const answer = 'response';

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ [formFields.ITEMS_FOR_CHANGEOVER]: answer })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        itemsForChangeover: { noDecisionRequired: false, answer },
      });
    });
  });
});

describe(`POST ${paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED}`, () => {
  it('should redirect to task list when the answer is entered and set itemsForChangeover', async () => {
    const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } };
    sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(sessionMock.handoverAndHolidays).toEqual({
      ...initialHandoverAndHolidays,
      itemsForChangeover: { noDecisionRequired: true },
    });
  });
});
