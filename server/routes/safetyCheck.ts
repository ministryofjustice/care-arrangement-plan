import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../@types/fields';
import config from '../config';
import formFields from '../constants/formFields';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig  from '../middleware/checkFormProgressFromConfig';
import validateSafetyCheckAccess from '../middleware/validateSafetyCheckAccess';
import addCompletedStep from '../utils/addCompletedStep';

const safetyCheckRoutes = (router: Router) => {
  router.get(
    paths.SAFETY_CHECK,
    validateSafetyCheckAccess,
    (request, response) => {
      // In production, back link goes to GDS start page (if configured); in development, to internal start page
      // If GDS URL is not set or is '/', don't show back link (interim solution - safety check is the entry point)
      const hasGdsUrl = config.gdsStartPageUrl && config.gdsStartPageUrl !== '/';
      const backLinkHref = config.production
        ? (hasGdsUrl ? config.gdsStartPageUrl : undefined)
        : paths.START;

      response.render('pages/safetyCheck', {
        errors: request.flash('errors'),
        title: request.__('safetyCheck.title'),
        backLinkHref,
      });
    }
  );

  router.get(paths.NOT_SAFE, checkFormProgressFromConfig(FORM_STEPS.NOT_SAFE),(request, response) => {
    addCompletedStep(request, FORM_STEPS.NOT_SAFE);
    response.render('pages/notSafe', {
      title: request.__('notSafe.title'),
      backLinkHref: paths.SAFETY_CHECK,
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
