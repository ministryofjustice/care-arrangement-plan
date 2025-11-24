import { Router } from 'express';

import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import { checkFormProgressFromConfig } from '../middleware/checkFormProgressFromConfig';

const existingCourtOrderRoutes = (router: Router) => {
  router.get(paths.EXISTING_COURT_ORDER, checkFormProgressFromConfig(FORM_STEPS.EXISTING_COURT_ORDER), (request, response) => {
    response.render('pages/existingCourtOrder', {
      title: request.__('existingCourtOrder.title'),
    });
  });
};

export default existingCourtOrderRoutes;
