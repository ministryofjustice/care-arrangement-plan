import { Router } from 'express';

import paths from '../constants/paths';
import { formattedChildrenNames } from '../utils/sessionHelpers';

const confirmationRoutes = (router: Router) => {
  router.get(paths.CONFIRMATION, (request, response) => {
    const childrenNames = formattedChildrenNames(request);

    response.render('pages/confirmation', {
      title: request.__('confirmation.title', { names: childrenNames }),
    });
  });
};

export default confirmationRoutes;
