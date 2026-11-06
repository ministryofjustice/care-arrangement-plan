import express, { Express, Router } from 'express';
import i18n from 'i18n';
import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import setUpWebRequestParsing from '../../middleware/setupRequestParsing';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

import routineDecisionsRoutes from './routineDecisions';

const buildApp = (): Express => {
  const app = express();
  app.disable('x-powered-by');
  app.use(setUpWebRequestParsing());
  app.use(i18n.init);
  app.use((req, _response, next) => {
    req.session = sessionMock;
    req.flash = flashMock;
    next();
  });

  const router = Router();
  routineDecisionsRoutes(router);
  app.use(router);

  return app;
};

const app = buildApp();
const pagesApp = testAppSetup();

describe(`${paths.EDUCATION_ROUTINE_DECISIONS} page`, () => {
  describe('GET', () => {
    it('should render the routine decisions page', async () => {
      sessionMock.namesOfChildren = ['Alex'];

      const response = await request(pagesApp).get(paths.EDUCATION_ROUTINE_DECISIONS).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        "How will routine decisions about Alex's education be made?",
      );
      expect(dom.window.document.querySelector('form')).toHaveAttribute('action', paths.EDUCATION_ROUTINE_DECISIONS);
    });

    it('should render a previously saved answer', async () => {
      sessionMock.namesOfChildren = ['Alex'];
      sessionMock.education = {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['bothParents'],
        },
      };

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_ROUTINE_DECISIONS)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_ROUTINE_DECISIONS_OPTION}-3`)).toBeChecked();
    });

    it('should render a saved arrangement description', async () => {
      const describeArrangement = 'Agreed in writing each term';
      sessionMock.education = {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement,
        },
      };

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_ROUTINE_DECISIONS)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_ROUTINE_DECISIONS_OPTION}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(describeArrangement);
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select how routine decisions about education will be made',
          path: formFields.EDUCATION_ROUTINE_DECISIONS_OPTION,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_ROUTINE_DECISIONS)).text);

      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_ROUTINE_DECISIONS_OPTION}-error`),
      ).toHaveTextContent('Select how routine decisions about education will be made');
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.education = {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['parent'],
        },
      };
      Object.assign(flashFormValues, [
        {
          [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT]: 'The school asks both homes',
        },
      ]);

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_ROUTINE_DECISIONS)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_ROUTINE_DECISIONS_OPTION}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue('The school asks both homes');
    });
  });
});

describe(paths.EDUCATION_ROUTINE_DECISIONS, () => {
  beforeEach(() => {
    sessionMock.education = {};
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Select how routine decisions about education will be made',
            path: formFields.EDUCATION_ROUTINE_DECISIONS_OPTION,
          }),
        ]),
      );
      expect(flashMock).toHaveBeenCalledWith('formValues', expect.any(Object));
      expect(sessionMock.completedSteps).toBeUndefined();
      expect(sessionMock.education?.routineDecisions).toBeUndefined();
    });

    it('should reload the page when another arrangement has no description', async () => {
      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({ [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'anotherArrangement' })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Describe the arrangement you are proposing',
            path: formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT,
          }),
        ]),
      );
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({
          [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT]: '   ',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.education?.routineDecisions).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it.each(['parent', 'otherParent', 'bothParents'] as const)(
      'should save %s and continue to school meetings',
      async (option) => {
        sessionMock.education = { shareInformation: { noDecisionRequired: true } };

        await request(app)
          .post(paths.EDUCATION_ROUTINE_DECISIONS)
          .send({ [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: option })
          .expect(302)
          .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

        expect(sessionMock.education).toEqual({
          shareInformation: { noDecisionRequired: true },
          routineDecisions: {
            noDecisionRequired: false,
            options: [option],
            describeArrangement: undefined,
          },
        });
        expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_ROUTINE_DECISIONS]);
      },
    );

    it('should save a trimmed description when another arrangement is selected', async () => {
      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({
          [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT]: '  Agreed in writing each term  ',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.education?.routineDecisions).toEqual({
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement: 'Agreed in writing each term',
      });
    });

    it('should clear a previous description when a standard option is selected', async () => {
      sessionMock.education = {
        routineDecisions: {
          noDecisionRequired: true,
          options: ['anotherArrangement'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({ [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'bothParents' })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.education?.routineDecisions).toEqual({
        noDecisionRequired: false,
        options: ['bothParents'],
        describeArrangement: undefined,
      });
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.EDUCATION_ROUTINE_DECISIONS];

      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({ [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'parent' })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_ROUTINE_DECISIONS]);
    });

    it('should keep validating when skip is not true', async () => {
      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({ skip: 'false' })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.completedSteps).toBeUndefined();
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped', async () => {
      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({ skip: 'true' })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.education?.routineDecisions).toEqual({
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_ROUTINE_DECISIONS]);
    });

    it('should replace a saved answer when the question is skipped', async () => {
      sessionMock.education = {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['parent'],
          describeArrangement: 'Old arrangement',
        },
      };
      sessionMock.completedSteps = [FORM_STEPS.EDUCATION_ROUTINE_DECISIONS];

      await request(app)
        .post(paths.EDUCATION_ROUTINE_DECISIONS)
        .send({
          skip: 'true',
          [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: 'otherParent',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.education?.routineDecisions).toEqual({
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_ROUTINE_DECISIONS]);
    });
  });
});
