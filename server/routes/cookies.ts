import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import { yesOrNo } from '../@types/fields';
import config from '../config';
import formFields from '../constants/formFields';
import paths from '../constants/paths';

const cookiesRoutes = (router: Router) => {
  router.get(paths.COOKIES, (_request, response) => {
    response.render('pages/cookies', {
      title: i18n.__('cookies.title'),
    });
  });

  router.post(paths.COOKIES, (request, response) => {
    const acceptAnalytics = request.body[formFields.ACCEPT_OPTIONAL_COOKIES] as yesOrNo;

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    response.cookie('cookie_policy', JSON.stringify({ acceptAnalytics }), {
      expires,
      secure: config.useHttps,
      httpOnly: false,
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
