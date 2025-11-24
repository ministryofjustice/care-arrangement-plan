import { Router } from 'express';

import paths from '../constants/paths';
import { formattedChildrenNames } from '../utils/sessionHelpers';
import { checkFormProgressFromConfig } from '../middleware/setUpFlowGuard';
import { FORM_STEPS } from '../constants/formSteps';
import { addCompletedStep } from '../utils/addCompletedStep';

const confirmationRoutes = (router: Router) => {
  router.get(paths.CONFIRMATION, checkFormProgressFromConfig(FORM_STEPS.CONFIRMATION), (request, response) => {
    const childrenNames = formattedChildrenNames(request);

    addCompletedStep(request, FORM_STEPS.CONFIRMATION);
    response.render('pages/confirmation', {
      title: request.__('confirmation.title', { names: childrenNames }),
    });
  });
};

export default confirmationRoutes;
