import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import createError from 'http-errors';

const devErrorRoutes = (router: Router) => {
  router.get('/dev/create-timeout', (_request: Request, _response: Response, next: NextFunction) => {
    next(createError(403));
  });
};

export default devErrorRoutes;
