import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { educationRoutineDecisionsField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { childrenReference, getBackUrl } from '../../utils/sessionHelpers';

const routineDecisionsRoutes = (router: Router) => {
  router.get(paths.EDUCATION_ROUTINE_DECISIONS, checkFormProgressFromConfig(FORM_STEPS.EDUCATION_ROUTINE_DECISIONS), (request, response) => {
    const errors = request.flash('errors');
    const childName = childrenReference(request);
    const formValues = {
      [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: request.session.education?.routineDecisions?.options?.[0],
      [formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT]: request.session.education?.routineDecisions?.describeArrangement,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/education/routineDecisions', {
      title: request.__('education.routineDecisions.title', { childName }),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      errors,
      formValues,
    });
  });

  router.post(
    paths.EDUCATION_ROUTINE_DECISIONS,
    checkFormProgressFromConfig(FORM_STEPS.EDUCATION_ROUTINE_DECISIONS),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      request.session.education = {
        ...request.session.education,
        routineDecisions: {
          ...request.session.education?.routineDecisions,
          noDecisionRequired: true,
          options: undefined,
          describeArrangement: undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.EDUCATION_ROUTINE_DECISIONS);

      return response.redirect(paths.EDUCATION_SCHOOL_MEETINGS);
    },
    body(formFields.EDUCATION_ROUTINE_DECISIONS_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('education.routineDecisions.emptyError')),
    body(formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.EDUCATION_ROUTINE_DECISIONS_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('education.routineDecisions.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT]: string;
        [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: educationRoutineDecisionsField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.EDUCATION_ROUTINE_DECISIONS);
      }

      const {
        [formFields.EDUCATION_ROUTINE_DECISIONS_OPTION]: option,
        [formFields.EDUCATION_ROUTINE_DECISIONS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.education = {
        ...request.session.education,
        routineDecisions: {
          ...request.session.education?.routineDecisions,
          noDecisionRequired: false,
          options: [option],
          describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.EDUCATION_ROUTINE_DECISIONS);

      return response.redirect(paths.EDUCATION_SCHOOL_MEETINGS);
    },
  );
};

export default routineDecisionsRoutes;
