import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.CHILD_HEALTH, () => {
  describe('GET', () => {
    it('should render the child health page', async () => {
      sessionMock.namesOfChildren = ['Alex'];

      const response = await request(app).get(paths.CHILD_HEALTH).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        "How will routine decisions about Alex's health be made?",
      );
    });

    it('should render a previously saved answer', async () => {
      sessionMock.namesOfChildren = ['Alex'];
      sessionMock.childHealth = {
        noDecisionRequired: false,
        options: ['bothParents'],
      };

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH)).text);

      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_OPTION}-3`)).toBeChecked();
    });

    it('should render a saved arrangement description', async () => {
      const describeArrangement = 'A grandparent will decide';
      sessionMock.childHealth = {
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement,
      };

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH)).text);

      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_OPTION}-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT}`)).toHaveValue(
        describeArrangement,
      );
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select how routine decisions about health will be made',
          path: formFields.CHILD_HEALTH_OPTION,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_OPTION}-error`)).toHaveTextContent(
        'Select how routine decisions about health will be made',
      );
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.childHealth = {
        noDecisionRequired: false,
        options: ['parent'],
      };
      Object.assign(flashFormValues, [
        {
          [formFields.CHILD_HEALTH_OPTION]: 'anotherArrangement',
          [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: 'Shared with a carer',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.CHILD_HEALTH)).text);

      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_OPTION}-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT}`)).toHaveValue(
        'Shared with a carer',
      );
    });
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app).post(paths.CHILD_HEALTH).expect(302).expect('location', paths.CHILD_HEALTH);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select how routine decisions about health will be made',
          path: formFields.CHILD_HEALTH_OPTION,
          type: 'field',
        },
      ]);
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when another arrangement is selected without a description', async () => {
      await request(app)
        .post(paths.CHILD_HEALTH)
        .send({ [formFields.CHILD_HEALTH_OPTION]: 'anotherArrangement' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe the arrangement you are proposing',
          path: formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT,
          type: 'field',
          value: '',
        },
      ]);
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the arrangement description is only whitespace', async () => {
      await request(app)
        .post(paths.CHILD_HEALTH)
        .send({
          [formFields.CHILD_HEALTH_OPTION]: 'anotherArrangement',
          [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: '   ',
        })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH);

      expect(sessionMock.completedSteps).toBeUndefined();
      expect(sessionMock.childHealth).toBeUndefined();
    });

    it('should save the answer and continue to health needs', async () => {
      await request(app)
        .post(paths.CHILD_HEALTH)
        .send({ [formFields.CHILD_HEALTH_OPTION]: 'bothParents' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.childHealth).toEqual({
        noDecisionRequired: false,
        options: ['bothParents'],
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH);
    });

    it('should save a description when another arrangement is selected', async () => {
      const describeArrangement = 'A grandparent will decide';

      await request(app)
        .post(paths.CHILD_HEALTH)
        .send({
          [formFields.CHILD_HEALTH_OPTION]: 'anotherArrangement',
          [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: describeArrangement,
        })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.childHealth).toEqual({
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement,
      });
      expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH);
    });

    it('should clear a previous description when a standard option is selected', async () => {
      sessionMock.childHealth = {
        noDecisionRequired: true,
        options: ['anotherArrangement'],
        describeArrangement: 'Old arrangement',
      };

      await request(app)
        .post(paths.CHILD_HEALTH)
        .send({ [formFields.CHILD_HEALTH_OPTION]: 'parent' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.childHealth).toEqual({
        noDecisionRequired: false,
        options: ['parent'],
        describeArrangement: undefined,
      });
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.CHILD_HEALTH];

      await request(app)
        .post(paths.CHILD_HEALTH)
        .send({ [formFields.CHILD_HEALTH_OPTION]: 'otherParent' })
        .expect(302)
        .expect('location', paths.CHILD_HEALTH_NEEDS);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.CHILD_HEALTH]);
    });
  });
});

describe(`POST ${paths.CHILD_HEALTH} skip`, () => {
  it('should mark the question as skipped and continue to health needs', async () => {
    await request(app)
      .post(paths.CHILD_HEALTH)
      .send({ skip: 'true' })
      .expect(302)
      .expect('location', paths.CHILD_HEALTH_NEEDS);

    expect(sessionMock.childHealth).toEqual({
      noDecisionRequired: true,
      options: undefined,
      describeArrangement: undefined,
    });
    expect(sessionMock.completedSteps).toContain(FORM_STEPS.CHILD_HEALTH);
  });

  it('should replace a saved answer when the question is skipped', async () => {
    sessionMock.childHealth = {
      noDecisionRequired: false,
      options: ['bothParents'],
      describeArrangement: 'Old arrangement',
    };
    sessionMock.completedSteps = [FORM_STEPS.CHILD_HEALTH];

    await request(app)
      .post(paths.CHILD_HEALTH)
      .send({
        skip: 'true',
        [formFields.CHILD_HEALTH_OPTION]: 'parent',
      })
      .expect(302)
      .expect('location', paths.CHILD_HEALTH_NEEDS);

    expect(sessionMock.childHealth).toEqual({
      noDecisionRequired: true,
      options: undefined,
      describeArrangement: undefined,
    });
    expect(sessionMock.completedSteps).toEqual([FORM_STEPS.CHILD_HEALTH]);
  });
});
