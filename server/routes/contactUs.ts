import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const contactUsRoutes = (router: Router) => {
  router.get(paths.CONTACT_US, (request, response) => {
    response.render('pages/contactUs', {
      title: i18n.__('contactUs.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });
};

export default contactUsRoutes;
