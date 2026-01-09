import type { Request, Response, NextFunction } from 'express';
import type { HTTPError } from 'superagent';

import config from './config';
import logger from './logging/logger';

// Some user agents (notably Chrome) probe these URLs automatically.
// They can safely 404 and shouldn't be logged as application errors.
const QUIET_404_PATH_PREFIXES = ['/.well-known/appspecific/'];

function shouldQuiet404(request: Request, status: number): boolean {
  if (status !== 404) return false;
  return QUIET_404_PATH_PREFIXES.some((prefix) => request.originalUrl?.startsWith(prefix));
}

export default function createErrorHandler() {
  return (error: HTTPError, request: Request, response: Response, _next: NextFunction): void => {
    const { production } = config;

    const status = error.status || 500;

    if (shouldQuiet404(request, status)) {
      logger.debug(`404 for '${request.originalUrl}' (suppressed)`);
    } else {
      logger.error(`Error handling request for '${request.originalUrl}'`, error);
    }

    response.locals.status = status;
    response.locals.stack = error.stack;

    response.status(status);

    return status === 404
      ? response.render('pages/errors/notFound', { title: request.__('errors.notFound.title') })
      : response.render('pages/errors/generic', {
          production,
          title: production ? request.__('errors.generic.title') : error.message,
        });
  };
}
