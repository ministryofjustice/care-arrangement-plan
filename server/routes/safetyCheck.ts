import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../@types/fields';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { checkFormProgressFromConfig } from '../middleware/checkFormProgressFromConfig';
import { addCompletedStep } from '../utils/addCompletedStep';
import { FORM_STEPS } from '../constants/formSteps';

const safetyCheckRoutes = (router: Router) => {
  router.get(paths.SAFETY_CHECK, checkFormProgressFromConfig(FORM_STEPS.SAFETY_CHECK), (request, response) => {
    response.render('pages/safetyCheck', {
      errors: request.flash('errors'),
      title: request.__('safetyCheck.title'),
    });
  });

  router.get(paths.NOT_SAFE, checkFormProgressFromConfig(FORM_STEPS.NOT_SAFE),(request, response) => {
    response.render('pages/notSafe', {
      title: request.__('notSafe.title'),
    });
  });

  router.post(
    paths.SAFETY_CHECK,
    body(formFields.SAFETY_CHECK)
      .exists()
      .withMessage((_value, { req }) => req.__('safetyCheck.error')),
    (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.SAFETY_CHECK);
      }

      const { [formFields.SAFETY_CHECK]: isSafe } = matchedData<{
        [formFields.SAFETY_CHECK]: yesOrNo;
      }>(request);

      addCompletedStep(request, FORM_STEPS.SAFETY_CHECK);

      return isSafe === 'Yes' ? response.redirect(paths.CHILDREN_SAFETY_CHECK) : response.redirect(paths.NOT_SAFE);
    },
  );
};

export default safetyCheckRoutes;
