import { Router } from 'express';

import config from '../config';
import paths from '../constants/paths';

/**
 * Middleware to redirect production requests to the start page (/) to either:
 * - The GDS gov.uk start page (when available), OR
 * - The safety check page (interim solution before GDS page exists)
 *
 * This ensures that in production, users cannot access the internal start page,
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

    // Redirect to safety check page (interim) or GDS start page (when available)
    // If GDS_START_PAGE_URL is not set or is '/', redirect to safety check
    const redirectUrl = config.gdsStartPageUrl && config.gdsStartPageUrl !== '/'
      ? config.gdsStartPageUrl
      : paths.SAFETY_CHECK;

    response.redirect(redirectUrl);
  });

  return router;
};

export default setupProductionStartRedirect;
