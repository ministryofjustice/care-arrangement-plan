import type { Router } from 'express-serve-static-core';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const contactUsRoutes = (router: Router) => {
  router.get(paths.CONTACT_US, (request, response) => {
    response.render('pages/contactUs', {
      title: request.__('contactUs.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });
};

export default contactUsRoutes;
