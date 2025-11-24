import { Router } from 'express';

import paths from '../constants/paths';
import { checkFormProgressFromConfig } from '../middleware/setUpFlowGuard';
import { FORM_STEPS } from '../constants/formSteps';

const existingCourtOrderRoutes = (router: Router) => {
  router.get(paths.EXISTING_COURT_ORDER, checkFormProgressFromConfig(FORM_STEPS.EXISTING_COURT_ORDER), (request, response) => {
    response.render('pages/existingCourtOrder', {
      title: request.__('existingCourtOrder.title'),
    });
  });
};

export default existingCourtOrderRoutes;
