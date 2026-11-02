import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { educationSchoolMeetingsField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { formattedChildrenNames, getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const schoolMeetingsRoutes = (router: Router) => {
  router.get(
    paths.EDUCATION_SCHOOL_MEETINGS,
    checkFormProgressFromConfig(FORM_STEPS.EDUCATION_SCHOOL_MEETINGS),
    (request, response) => {
      const errors = request.flash('errors');
      const childName = formattedChildrenNames(request);
      const formValues = {
        [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: request.session.education?.schoolMeetings?.options?.[0],
        [formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT]:
          request.session.education?.schoolMeetings?.describeArrangement,
        ...request.flash('formValues')?.[0],
      };

      response.render('pages/education/schoolMeetings', {
        title: request.__('education.schoolMeetings.title', { childName }),
        childName,
        backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
        errors,
        formValues,
      });
    },
  );

  router.post(
    paths.EDUCATION_SCHOOL_MEETINGS,
    checkFormProgressFromConfig(FORM_STEPS.EDUCATION_SCHOOL_MEETINGS),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      request.session.education = {
        ...request.session.education,
        schoolMeetings: {
          ...request.session.education?.schoolMeetings,
          noDecisionRequired: true,
          options: undefined,
          describeArrangement: undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.EDUCATION_SCHOOL_MEETINGS);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
    body(formFields.EDUCATION_SCHOOL_MEETINGS_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('education.schoolMeetings.emptyError')),
    body(formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.EDUCATION_SCHOOL_MEETINGS_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('education.schoolMeetings.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT]: string;
        [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: educationSchoolMeetingsField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.EDUCATION_SCHOOL_MEETINGS);
      }

      const {
        [formFields.EDUCATION_SCHOOL_MEETINGS_OPTION]: option,
        [formFields.EDUCATION_SCHOOL_MEETINGS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.education = {
        ...request.session.education,
        schoolMeetings: {
          ...request.session.education?.schoolMeetings,
          noDecisionRequired: false,
          options: [option],
          describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.EDUCATION_SCHOOL_MEETINGS);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );
};

export default schoolMeetingsRoutes;
