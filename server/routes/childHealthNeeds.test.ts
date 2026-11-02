import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.CHILD_HEALTH_NEEDS, () => {
  describe('GET', () => {
    it('should render the child health needs page', async () => {
      sessionMock.namesOfChildren = ['Alex'];

      const response = await request(app).get(paths.CHILD_HEALTH_NEEDS).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent("What are Alex's health needs?");
    });

    it('should render a previously saved description', async () => {
      const description = 'Asthma inhaler every morning';
      sessionMock.childHealthNeeds = { noDecisionRequired: false, description };

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH_NEEDS)).text);

      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_NEEDS_DESCRIPTION}`)).toHaveValue(
        description,
      );
    });

    it('should render flashed errors and prefer flashed text', async () => {
      sessionMock.childHealthNeeds = { noDecisionRequired: false, description: 'Saved description' };
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Describe the health needs',
          path: formFields.CHILD_HEALTH_NEEDS_DESCRIPTION,
          type: 'field',
        },
      ]);
      Object.assign(flashFormValues, [{ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: '   ' }]);

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH_NEEDS)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_NEEDS_DESCRIPTION}`)).toHaveValue('   ');
      expect(
        dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_NEEDS_DESCRIPTION}-error`),
      ).toHaveTextContent('Describe the health needs');
    });
  });

  describe('POST', () => {
    it('should reload the page when the description is empty', async () => {
      await request(app).post(paths.CHILD_HEALTH_NEEDS).expect(302).expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe the health needs',
          path: formFields.CHILD_HEALTH_NEEDS_DESCRIPTION,
          type: 'field',
          value: '',
        },
      ]);
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: '   ' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.childHealthNeeds).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should save the description and return to the task list', async () => {
      const description = 'Regular asthma reviews';

      await request(app)
        .post(paths.CHILD_HEALTH_NEEDS)
        .send({ [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: description })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.childHealthNeeds).toEqual({
        noDecisionRequired: false,
        description,
      });
      expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH_NEEDS);
    });
  });
});

describe(`POST ${paths.CHILD_HEALTH_NEEDS} skip`, () => {
  it('should mark the question as skipped and return to the task list', async () => {
    await request(app)
      .post(paths.CHILD_HEALTH_NEEDS)
      .send({ skip: 'true' })
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(sessionMock.childHealthNeeds).toEqual({ noDecisionRequired: true });
    expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH_NEEDS);
  });

  it('should replace a saved description when the question is skipped', async () => {
    sessionMock.childHealthNeeds = { noDecisionRequired: false, description: 'Asthma inhaler' };
    sessionMock.completedSteps = [FORM_STEPS.CHILD_HEALTH_NEEDS];

    await request(app)
      .post(paths.CHILD_HEALTH_NEEDS)
      .send({ skip: 'true', [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: 'Ignored text' })
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(sessionMock.childHealthNeeds).toEqual({ noDecisionRequired: true });
    expect(sessionMock.completedSteps).toEqual([FORM_STEPS.CHILD_HEALTH_NEEDS]);
  });
});
