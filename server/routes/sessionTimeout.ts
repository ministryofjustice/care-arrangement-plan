import { Router } from 'express';

import paths from '../constants/paths';

const sessionTimeoutRoutes = (router: Router) => {
  router.get(paths.SESSION_TIMEOUT, (request, response) => {
    const locale = request.getLocale();

    request.setLocale(locale);
    response.status(403);
    response.render('pages/errors/timeOut', {
      title: request.__('errors.timeOut.title'),
    });

    response.on('finish', () => {
      if (typeof request.session?.destroy === 'function') {
        request.session.destroy(() => {});
      }
    });
  });
};

export default sessionTimeoutRoutes;
