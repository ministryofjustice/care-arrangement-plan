import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { childrenReference, getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const childHealthNeedsRoutes = (router: Router) => {
  router.get(paths.CHILD_HEALTH_NEEDS, checkFormProgressFromConfig(FORM_STEPS.CHILD_HEALTH_NEEDS), (request, response) => {
    const errors = request.flash('errors');
    const childName = childrenReference(request);
    const formValues = {
      [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: request.session.childHealth?.childHealthNeeds?.description,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/childHealthNeeds', {
      title: request.__('childHealth.healthNeeds.title', { childName }),
      backLinkHref: getBackUrl(request.session, paths.CHILD_HEALTH),
      errors,
      formValues,
    });
  });

  router.post(
    paths.CHILD_HEALTH_NEEDS,
    checkFormProgressFromConfig(FORM_STEPS.CHILD_HEALTH_NEEDS),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      request.session.childHealth = {
        ...request.session.childHealth,
        childHealthNeeds: {
          noDecisionRequired: true,
        },
      };

      addCompletedStep(request, FORM_STEPS.CHILD_HEALTH_NEEDS);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
    body(formFields.CHILD_HEALTH_NEEDS_DESCRIPTION)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('childHealth.healthNeeds.emptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.CHILD_HEALTH_NEEDS_DESCRIPTION]: string;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.CHILD_HEALTH_NEEDS);
      }

      request.session.childHealth = {
        ...request.session.childHealth,
        childHealthNeeds: {
          noDecisionRequired: false,
          description: formData[formFields.CHILD_HEALTH_NEEDS_DESCRIPTION],
        },
      };

      addCompletedStep(request, FORM_STEPS.CHILD_HEALTH_NEEDS);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );
};

export default childHealthNeedsRoutes;
