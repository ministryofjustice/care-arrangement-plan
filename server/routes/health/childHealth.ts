import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { childHealthRoutineDecisionsField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { formattedChildrenNames, getBackUrl } from '../../utils/sessionHelpers';

const childHealthRoutes = (router: Router) => {
  router.get(paths.CHILD_HEALTH, checkFormProgressFromConfig(FORM_STEPS.CHILD_HEALTH), (request, response) => {
    const errors = request.flash('errors');
    const childName = formattedChildrenNames(request);
    const formValues = {
      [formFields.CHILD_HEALTH_OPTION]: request.session.childHealth?.routineDecisions?.options?.[0],
      [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]:
        request.session.childHealth?.routineDecisions?.describeArrangement,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/childHealth', {
      title: request.__('childHealth.routineDecisions.title', { childName }),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      errors,
      formValues,
    });
  });

  router.post(
    paths.CHILD_HEALTH,
    checkFormProgressFromConfig(FORM_STEPS.CHILD_HEALTH),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      request.session.childHealth = {
        ...request.session.childHealth,
        routineDecisions: {
          ...request.session.childHealth?.routineDecisions,
          noDecisionRequired: true,
          options: undefined,
          describeArrangement: undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.CHILD_HEALTH);

      return response.redirect(paths.CHILD_HEALTH_NEEDS);
    },
    body(formFields.CHILD_HEALTH_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('childHealth.routineDecisions.emptyError')),
    body(formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.CHILD_HEALTH_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('childHealth.routineDecisions.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: string;
        [formFields.CHILD_HEALTH_OPTION]: childHealthRoutineDecisionsField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.CHILD_HEALTH);
      }

      const {
        [formFields.CHILD_HEALTH_OPTION]: option,
        [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.childHealth = {
        ...request.session.childHealth,
        routineDecisions: {
          ...request.session.childHealth?.routineDecisions,
          noDecisionRequired: false,
          options: [option],
          describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.CHILD_HEALTH);

      return response.redirect(paths.CHILD_HEALTH_NEEDS);
    },
  );
};

export default childHealthRoutes;
