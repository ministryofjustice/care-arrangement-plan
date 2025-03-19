import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';

const termsAndConditionsRoutes = (router: Router) => {
  router.get(paths.TERMS_AND_CONDITIONS, (_request, response) => {
    response.render('pages/termsAndConditions', {
      title: i18n.__('termsAndConditions.title'),
    });
  });
};

export default termsAndConditionsRoutes;
