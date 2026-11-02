import express, { Express, Router } from 'express';
import i18n from 'i18n';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import setUpWebRequestParsing from '../../middleware/setupRequestParsing';
import { flashMock, sessionMock } from '../../test-utils/testMocks';

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
            msg: 'education.shareInformation.emptyError',
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
            msg: 'education.shareInformation.descriptionEmptyError',
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
