import type { Request, Response } from 'express';

export default function sendSessionTimeoutResponse(request: Request, response: Response): void {
  response.status(403).render('pages/errors/timeOut', {
    title: request.__('errors.timeOut.title'),
  });
}
