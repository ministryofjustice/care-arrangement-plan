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

import schoolMeetingsRoutes from './schoolMeetings';

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
  schoolMeetingsRoutes(router);
  app.use(router);

  return app;
};

const app = buildApp();
const pagesApp = testAppSetup();

describe(`${paths.EDUCATION_SCHOOL_MEETINGS} page`, () => {
  describe('GET', () => {
    it('should render the school meetings page', async () => {
      sessionMock.namesOfChildren = ['Alex'];

      const response = await request(pagesApp).get(paths.EDUCATION_SCHOOL_MEETINGS).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        "Who will attend Alex's school meetings and activities?",
      );
      expect(dom.window.document.querySelector('form')).toHaveAttribute('action', paths.EDUCATION_SCHOOL_MEETINGS);
      expect(dom.window.document.body).toHaveTextContent('The parent caring for Alex at the time will attend');
    });

    it('should render a previously saved answer', async () => {
      sessionMock.namesOfChildren = ['Alex'];
      sessionMock.education = {
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['carer'],
        },
      };

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SCHOOL_MEETINGS)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_SCHOOL_MEETINGS_OPTION}-4`)).toBeChecked();
    });

    it('should render a saved arrangement description', async () => {
      const describeArrangement = 'A grandparent will attend';
      sessionMock.education = {
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement,
        },
      };

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SCHOOL_MEETINGS)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_SCHOOL_MEETINGS_OPTION}-6`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(describeArrangement);
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select who will attend school meetings and activities',
          path: formFields.EDUCATION_SCHOOL_MEETINGS_OPTION,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SCHOOL_MEETINGS)).text);

      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_SCHOOL_MEETINGS_OPTION}-error`),
      ).toHaveTextContent('Select who will attend school meetings and activities');
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.education = {
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['parent'],
        },
      };
      Object.assign(flashFormValues, [
        {
          [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT]: 'A carer collects reports',
        },
      ]);

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SCHOOL_MEETINGS)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_SCHOOL_MEETINGS_OPTION}-6`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue('A carer collects reports');
    });
  });
});

describe(paths.EDUCATION_SCHOOL_MEETINGS, () => {
  beforeEach(() => {
    sessionMock.education = {};
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Select who will attend school meetings and activities',
            path: formFields.EDUCATION_SCHOOL_MEETINGS_OPTION,
          }),
        ]),
      );
      expect(flashMock).toHaveBeenCalledWith('formValues', expect.any(Object));
      expect(sessionMock.completedSteps).toBeUndefined();
      expect(sessionMock.education?.schoolMeetings).toBeUndefined();
    });

    it('should reload the page when another arrangement has no description', async () => {
      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({ [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'anotherArrangement' })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Describe the arrangement you are proposing',
            path: formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT,
          }),
        ]),
      );
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({
          [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT]: '   ',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.education?.schoolMeetings).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it.each(['parent', 'otherParent', 'bothParents', 'carer'] as const)(
      'should save %s and return to the task list',
      async (option) => {
        sessionMock.education = { shareInformation: { noDecisionRequired: true } };

        await request(app)
          .post(paths.EDUCATION_SCHOOL_MEETINGS)
          .send({ [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: option })
          .expect(302)
          .expect('location', paths.TASK_LIST);

        expect(sessionMock.education).toEqual({
          shareInformation: { noDecisionRequired: true },
          schoolMeetings: {
            noDecisionRequired: false,
            options: [option],
            describeArrangement: undefined,
          },
        });
        expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SCHOOL_MEETINGS]);
      },
    );

    it('should save a trimmed description when another arrangement is selected', async () => {
      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({
          [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT]: '  A grandparent attends parents evening  ',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.education?.schoolMeetings).toEqual({
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement: 'A grandparent attends parents evening',
      });
    });

    it('should clear a previous description when a standard option is selected', async () => {
      sessionMock.education = {
        schoolMeetings: {
          noDecisionRequired: true,
          options: ['anotherArrangement'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({ [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'carer' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.education?.schoolMeetings).toEqual({
        noDecisionRequired: false,
        options: ['carer'],
        describeArrangement: undefined,
      });
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({ [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'bothParents' })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.EDUCATION_SCHOOL_MEETINGS];

      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({ [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'parent' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SCHOOL_MEETINGS]);
    });

    it('should keep validating when skip is not true', async () => {
      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({ skip: 'false' })
        .expect(302)
        .expect('location', paths.EDUCATION_SCHOOL_MEETINGS);

      expect(sessionMock.completedSteps).toBeUndefined();
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and return to the task list', async () => {
      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({ skip: 'true' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.education?.schoolMeetings).toEqual({
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SCHOOL_MEETINGS]);
    });

    it('should replace a saved answer when the question is skipped', async () => {
      sessionMock.education = {
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['parent'],
          describeArrangement: 'Old arrangement',
        },
      };
      sessionMock.completedSteps = [FORM_STEPS.EDUCATION_SCHOOL_MEETINGS];

      await request(app)
        .post(paths.EDUCATION_SCHOOL_MEETINGS)
        .send({
          skip: 'true',
          [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: 'otherParent',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.education?.schoolMeetings).toEqual({
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SCHOOL_MEETINGS]);
    });
  });
});
