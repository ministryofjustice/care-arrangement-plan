import { Router } from 'express';

import paths from '../constants/paths';

const existingCourtOrderRoutes = (router: Router) => {
  router.get(paths.EXISTING_COURT_ORDER, (request, response) => {
    response.render('pages/existingCourtOrder', {
      title: request.__('existingCourtOrder.title'),
    });
  });
};

export default existingCourtOrderRoutes;
