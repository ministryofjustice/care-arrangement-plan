import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { sessionMock } from '../../test-utils/testMocks';

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
  });
});
