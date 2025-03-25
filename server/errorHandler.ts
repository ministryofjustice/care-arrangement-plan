import type { Request, Response, NextFunction } from 'express';
import type { HTTPError } from 'superagent';

import config from './config';
import logger from './logger';

export default function createErrorHandler() {
  return (error: HTTPError, request: Request, response: Response, _next: NextFunction): void => {
    const { production } = config;
    logger.error(`Error handling request for '${request.originalUrl}'`, error);

    const status = error.status || 500;

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
