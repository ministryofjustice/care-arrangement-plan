import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import { yesOrNo } from '../@types/fields';
import config from '../config';
import cookieNames from '../constants/cookieNames';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const cookiesRoutes = (router: Router) => {
  router.get(paths.COOKIES, (request, response) => {
    response.render('pages/cookies', {
      title: i18n.__('cookies.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });

  router.post(paths.COOKIES, (request, response) => {
    const acceptAnalytics = request.body[formFields.ACCEPT_OPTIONAL_COOKIES] as yesOrNo;

    response.cookie(cookieNames.ANALYTICS_CONSENT, JSON.stringify({ acceptAnalytics }), {
      maxAge: 1000 * 60 * 60 * 24 * 365, // One Year
      secure: config.useHttps,
      httpOnly: false,
      sameSite: 'lax',
    });

    if (acceptAnalytics === 'No') {
      const domain = request.hostname;

      response.clearCookie('_ga', { domain, secure: false, httpOnly: false });
      response.clearCookie(`_ga_${config.analytics.ga4Id.replace('G-', '')}`, {
        domain,
        secure: false,
        httpOnly: false,
      });
    }

    return response.redirect(paths.COOKIES);
  });
};

export default cookiesRoutes;
