import { Router } from 'express';
import i18n from 'i18n';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const existingCourtOrderRoutes = (router: Router) => {
  router.get(paths.EXISTING_COURT_ORDER, (request, response) => {
    response.render('pages/existingCourtOrder', {
      title: i18n.__('existingCourtOrder.title'),
      backLinkHref: getBackUrl(request.session, paths.COURT_ORDER_CHECK),
    });
  });
};

export default existingCourtOrderRoutes;
