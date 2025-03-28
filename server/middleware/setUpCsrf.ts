import { csrfSync } from 'csrf-sync';
import { Router } from 'express';

const testMode = process.env.NODE_ENV === 'test';

const setUpCsrf = (): Router => {
  const router = Router({ mergeParams: true });

  // CSRF protection
  if (!testMode) {
    const {
      csrfSynchronisedProtection, // This is the default CSRF protection middleware.
    } = csrfSync({
      // By default, csrf-sync uses x-csrf-token header, but we use the token in forms and send it in the request body, so change getTokenFromRequest so it grabs from there
      getTokenFromRequest: (req) => {
        return req.body._csrf;
      },
    });

    router.use(csrfSynchronisedProtection);
  }

  router.use((request, response, next) => {
    if (typeof request.csrfToken === 'function') {
      response.locals.csrfToken = request.csrfToken();
    }
    next();
  });

  return router;
};

export default setUpCsrf;
