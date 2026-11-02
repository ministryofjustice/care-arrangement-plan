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

import shareInformationRoutes from './shareInformation';

const buildApp = (): Express => {
  const app = express();
  app.use(setUpWebRequestParsing());
  app.use(i18n.init);
  app.use((req, _response, next) => {
    req.session = sessionMock;
    req.flash = flashMock;
    next();
  });

  const router = Router();
  shareInformationRoutes(router);
  app.use(router);

  return app;
};

const app = buildApp();
const pagesApp = testAppSetup();

describe(`${paths.EDUCATION_SHARE_INFORMATION} page`, () => {
  describe('GET', () => {
    it('should render the share information page', async () => {
      sessionMock.namesOfChildren = ['Alex'];

      const response = await request(pagesApp).get(paths.EDUCATION_SHARE_INFORMATION).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        "How should information from Alex's school be shared?",
      );
      expect(dom.window.document.querySelector('form')).toHaveAttribute('action', paths.EDUCATION_SHARE_INFORMATION);
    });

    it('should render a previously saved answer', async () => {
      sessionMock.namesOfChildren = ['Alex'];
      sessionMock.education = {
        shareInformation: {
          noDecisionRequired: false,
          options: ['bothParents'],
        },
      };

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SHARE_INFORMATION)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_SHARE_INFORMATION_OPTION}-3`)).toBeChecked();
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select how information from the school should be shared',
          path: formFields.EDUCATION_SHARE_INFORMATION_OPTION,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SHARE_INFORMATION)).text);

      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_SHARE_INFORMATION_OPTION}-error`),
      ).toHaveTextContent('Select how information from the school should be shared');
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.education = {
        shareInformation: {
          noDecisionRequired: false,
          options: ['parent'],
        },
      };
      Object.assign(flashFormValues, [
        {
          [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT]: 'The school emails a grandparent',
        },
      ]);

      const dom = new JSDOM((await request(pagesApp).get(paths.EDUCATION_SHARE_INFORMATION)).text);

      expect(dom.window.document.querySelector(`#${formFields.EDUCATION_SHARE_INFORMATION_OPTION}-5`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue('The school emails a grandparent');
    });
  });
});

describe(paths.EDUCATION_SHARE_INFORMATION, () => {
  beforeEach(() => {
    sessionMock.education = {};
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .expect(302)
        .expect('location', paths.EDUCATION_SHARE_INFORMATION);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Select how information from the school should be shared',
            path: formFields.EDUCATION_SHARE_INFORMATION_OPTION,
          }),
        ]),
      );
      expect(flashMock).toHaveBeenCalledWith('formValues', expect.any(Object));
      expect(sessionMock.completedSteps).toBeUndefined();
      expect(sessionMock.education?.shareInformation).toBeUndefined();
    });

    it('should reload the page when another arrangement has no description', async () => {
      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({ [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'anotherArrangement' })
        .expect(302)
        .expect('location', paths.EDUCATION_SHARE_INFORMATION);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Describe the arrangement you are proposing',
            path: formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT,
          }),
        ]),
      );
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({
          [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT]: '   ',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_SHARE_INFORMATION);

      expect(sessionMock.education?.shareInformation).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it.each(['parent', 'otherParent', 'bothParents'] as const)(
      'should save %s and continue to routine decisions',
      async (option) => {
        sessionMock.education = { schoolMeetings: { noDecisionRequired: true } };

        await request(app)
          .post(paths.EDUCATION_SHARE_INFORMATION)
          .send({ [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: option })
          .expect(302)
          .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

        expect(sessionMock.education).toEqual({
          schoolMeetings: { noDecisionRequired: true },
          shareInformation: {
            noDecisionRequired: false,
            options: [option],
            describeArrangement: undefined,
          },
        });
        expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SHARE_INFORMATION]);
      },
    );

    it('should save a trimmed description when another arrangement is selected', async () => {
      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({
          [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'anotherArrangement',
          [formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT]: '  The school emails both homes  ',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.education?.shareInformation).toEqual({
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement: 'The school emails both homes',
      });
    });

    it('should clear a previous description when a standard option is selected', async () => {
      sessionMock.education = {
        shareInformation: {
          noDecisionRequired: true,
          options: ['anotherArrangement'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({ [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'parent' })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.education?.shareInformation).toEqual({
        noDecisionRequired: false,
        options: ['parent'],
        describeArrangement: undefined,
      });
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.EDUCATION_SHARE_INFORMATION];

      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({ [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'otherParent' })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SHARE_INFORMATION]);
    });

    it('should keep validating when skip is not true', async () => {
      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({ skip: 'false' })
        .expect(302)
        .expect('location', paths.EDUCATION_SHARE_INFORMATION);

      expect(sessionMock.completedSteps).toBeUndefined();
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and continue to routine decisions', async () => {
      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({ skip: 'true' })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.education?.shareInformation).toEqual({
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SHARE_INFORMATION]);
    });

    it('should replace a saved answer when the question is skipped', async () => {
      sessionMock.education = {
        shareInformation: {
          noDecisionRequired: false,
          options: ['bothParents'],
          describeArrangement: 'Old arrangement',
        },
      };
      sessionMock.completedSteps = [FORM_STEPS.EDUCATION_SHARE_INFORMATION];

      await request(app)
        .post(paths.EDUCATION_SHARE_INFORMATION)
        .send({
          skip: 'true',
          [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: 'parent',
        })
        .expect(302)
        .expect('location', paths.EDUCATION_ROUTINE_DECISIONS);

      expect(sessionMock.education?.shareInformation).toEqual({
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.EDUCATION_SHARE_INFORMATION]);
    });
  });
});
