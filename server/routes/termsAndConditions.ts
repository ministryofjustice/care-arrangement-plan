import type { Router } from 'express-serve-static-core';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const termsAndConditionsRoutes = (router: Router) => {
  router.get(paths.TERMS_AND_CONDITIONS, (request, response) => {
    response.render('pages/termsAndConditions', {
      title: request.__('termsAndConditions.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });
};

export default termsAndConditionsRoutes;
