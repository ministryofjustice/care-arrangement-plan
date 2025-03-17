import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';

const privacyNoticeRoutes = (router: Router) => {
  router.get(paths.PRIVACY_NOTICE, (_request, response) => {
    response.render('pages/privacyNotice', {
      title: i18n.__('privacyNotice.title'),
    });
  });
};

export default privacyNoticeRoutes;
