import { JSDOM } from 'jsdom';
import request from 'supertest';

import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT, () => {
  describe('GET', () => {
    it('should render the consent to travel page', async () => {
      const response = await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Permission for taking the children abroad');
      expect(dom.window.document.querySelector('form')).toHaveAttribute(
        'action',
        paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT,
      );
    });
  });

  describe('POST', () => {
    it('should continue to travel information', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT]);
    });

    it('should return to the task list when saving to come back later', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT)
        .send({ saveAndComeBackLater: 'true' })
        .expect(302)
        .expect('location', paths.TASK_LIST);
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT)
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT];

      await request(app).post(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT).expect(302);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT]);
    });
  });
});
