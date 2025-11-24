import { Router } from 'express';

import { FORM_STEPS } from '../constants/formSteps';
import paths from '../constants/paths';
import { checkFormProgressFromConfig } from '../middleware/checkFormProgressFromConfig';
import { addCompletedStep } from '../utils/addCompletedStep';
import { formattedChildrenNames } from '../utils/sessionHelpers';

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
