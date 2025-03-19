import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';

const contactUsRoutes = (router: Router) => {
  router.get(paths.CONTACT_US, (_request, response) => {
    response.render('pages/contactUs', {
      title: i18n.__('contactUs.title'),
    });
  });
};

export default contactUsRoutes;
