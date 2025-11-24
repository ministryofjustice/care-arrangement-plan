import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';
import { FORM_STEPS } from '../constants/formSteps';
import { checkFormProgressFromConfig } from '../middleware/setUpFlowGuard';
import { addCompletedStep } from '../utils/addCompletedStep';

const doWhatsBestRoutes = (router: Router) => {
  router.get(paths.DO_WHATS_BEST, checkFormProgressFromConfig(FORM_STEPS.DO_WHATS_BEST), (request, response) => {
    response.render('pages/doWhatsBest', {
      errors: request.flash('errors'),
      title: request.__('doWhatsBest.title'),
      backLinkHref: getBackUrl(request.session, paths.CHILDREN_SAFETY_CHECK),
    });
  });

  router.post(
    paths.DO_WHATS_BEST,
    body(formFields.DO_WHATS_BEST)
      .exists()
      .withMessage((_value, { req }) => req.__('doWhatsBest.error')),
    (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.DO_WHATS_BEST);
      }

      addCompletedStep(request, FORM_STEPS.DO_WHATS_BEST);
      return response.redirect(paths.COURT_ORDER_CHECK);
    },
  );
};

export default doWhatsBestRoutes;
