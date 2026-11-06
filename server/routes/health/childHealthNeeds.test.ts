import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.CHILD_HEALTH_NEEDS, () => {
  describe('GET', () => {
    it('should render the health needs page', async () => {
      sessionMock.namesOfChildren = ['Alex'];

      const response = await request(app).get(paths.CHILD_HEALTH_NEEDS).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent("What are Alex's health needs?");
      expect(dom.window.document.querySelector('form')).toHaveAttribute('action', paths.CHILD_HEALTH_NEEDS);
      expect(response.text).toContain('For example, health routines, medical conditions');
      expect(response.text).toContain(`href="${paths.CHILD_HEALTH}"`);
    });

    it('should render a previously saved description', async () => {
      const description = 'Inhaler every morning';
      sessionMock.childHealth = {
        childHealthNeeds: {
          noDecisionRequired: false,
          description,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH_NEEDS)).text);

      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_NEEDS_DESCRIPTION}`)).toHaveValue(
        description,
      );
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Describe the health needs',
          path: formFields.CHILD_HEALTH_NEEDS_DESCRIPTION,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH_NEEDS)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(
        dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_NEEDS_DESCRIPTION}-error`),
      ).toHaveTextContent('Describe the health needs');
    });

    it('should prefer a flashed description over the saved description', async () => {
      sessionMock.childHealth = {
        childHealthNeeds: {
          noDecisionRequired: false,
          description: 'Saved description',
        },
      };
      Object.assign(flashFormValues, [
        {
          [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: 'Flashed description',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH_NEEDS)).text);

      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_NEEDS_DESCRIPTION}`)).toHaveValue(
        'Flashed description',
      );
    });
  });

  describe('POST', () => {
    it('should reload the page when the description is empty', async () => {
      await request(app).post(paths.CHILD_HEALTH_NEEDS).expect(302).expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Describe the health needs',
            path: formFields.CHILD_HEALTH_NEEDS_DESCRIPTION,
          }),
        ]),
      );
      expect(sessionMock.childHealth).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      sessionMock.childHealth = {
        routineDecisions: { noDecisionRequired: true },
      };

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: '   ' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.childHealth).toEqual({
        routineDecisions: { noDecisionRequired: true },
      });
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should save a trimmed description and keep the routine decision', async () => {
      sessionMock.childHealth = {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['bothParents'],
        },
      };

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: '  Inhaler every morning  ' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.childHealth).toEqual({
        routineDecisions: {
          noDecisionRequired: false,
          options: ['bothParents'],
        },
        childHealthNeeds: {
          noDecisionRequired: false,
          description: 'Inhaler every morning',
        },
      });
      expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH_NEEDS);
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: 'Inhaler every morning' })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.CHILD_HEALTH_NEEDS];

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: 'Inhaler every morning' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.CHILD_HEALTH_NEEDS]);
    });

    it('should keep validating when skip is not true', async () => {
      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ skip: 'false' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.completedSteps).toBeUndefined();
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and return to the task list', async () => {
      sessionMock.childHealth = {
        routineDecisions: { noDecisionRequired: false, options: ['parent'] },
      };

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ skip: 'true' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.childHealth).toEqual({
        routineDecisions: { noDecisionRequired: false, options: ['parent'] },
        childHealthNeeds: { noDecisionRequired: true },
      });
      expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH_NEEDS);
    });

    it('should replace a saved description when the question is skipped', async () => {
      sessionMock.childHealth = {
        routineDecisions: { noDecisionRequired: true },
        childHealthNeeds: { noDecisionRequired: false, description: 'Old description' },
      };
      sessionMock.completedSteps = [FORM_STEPS.CHILD_HEALTH_NEEDS];

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({
          skip: 'true',
          [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: 'New description',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.childHealth).toEqual({
        routineDecisions: { noDecisionRequired: true },
        childHealthNeeds: { noDecisionRequired: true },
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.CHILD_HEALTH_NEEDS]);
    });

    it('should return to check your answers when a skipped question was opened from there', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ skip: 'true' })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });
  });
});
