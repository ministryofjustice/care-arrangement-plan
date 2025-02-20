import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import i18n from 'i18n'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, request: Request, response: Response, _next: NextFunction): void => {
    logger.error(`Error handling request for '${request.originalUrl}'`, error)

    const status = error.status || 500

    response.locals.status = status
    response.locals.stack = error.stack

    response.status(status)

    return status === 404
      ? response.render('pages/errors/notFound', { title: i18n.__('errors.notFound.title') })
      : response.render('pages/errors/generic', {
          production,
          title: production ? i18n.__('errors.generic.title') : error.message,
        })
  }
}
