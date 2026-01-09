import { Router } from 'express';

import config from '../config';
import paths from '../constants/paths';

/**
 * Middleware to redirect production requests to the start page (/) to the GDS gov.uk start page.
 * This ensures that in production, users must come through the official GDS start page,
 * while in development the internal start page remains accessible for testing.
 */
const setupProductionStartRedirect = (): Router => {
  const router = Router();

  router.use(paths.START, (request, response, next) => {
    // Only redirect in production environment
    if (!config.production) {
      return next();
    }

    // Only redirect GET requests to avoid interfering with form submissions
    if (request.method !== 'GET') {
      return next();
    }

    // Redirect to the GDS gov.uk start page
    response.redirect(config.gdsStartPageUrl);
  });

  return router;
};

export default setupProductionStartRedirect;
