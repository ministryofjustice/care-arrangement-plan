import { Router } from 'express';

import logger from '../logger';

const setupRequestLogging = (): Router => {
  const router = Router();

  router.use('*', (request, response, next) => {
    const start = performance.now();
    logger.info(`Received ${request.method} ${request.originalUrl}`);

    response.on('finish', () => {
      const duration = performance.now() - start;
      logger.info(
        `Responded to ${request.method} ${request.originalUrl} with ${response.statusCode} in ${duration.toFixed(0)}ms`,
      );
    });
    next();
  });
  return router;
};

export default setupRequestLogging;
