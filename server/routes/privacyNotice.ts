import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const privacyNoticeRoutes = (router: Router) => {
  router.get(paths.PRIVACY_NOTICE, (request, response) => {
    response.render('pages/privacyNotice', {
      title: i18n.__('privacyNotice.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });
};

export default privacyNoticeRoutes;
