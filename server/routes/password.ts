import type { Response, Request, Router } from 'express-serve-static-core';
import { body, validationResult } from 'express-validator';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import logger from '../logger';
import encryptPassword from '../utils/encryptPassword';

const passwordRoutes = (router: Router) => {
  router.get(paths.PASSWORD, handleGetPassword);
  router.post(
    paths.PASSWORD,
    body(formFields.PASSWORD)
      .custom((submittedPassword: string) => {
        return config.passwords.some((p) => submittedPassword === p);
      })
      .withMessage('The password is not correct'),
    handlePostPassword,
  );
};

const handlePostPassword = (request: Request, response: Response) => {
  const providedUrl = typeof request.body.returnURL === 'string' ? request.body.returnURL : null;
  const processedRedirectUrl = !providedUrl || providedUrl.startsWith(paths.PASSWORD) ? '/' : providedUrl;
  const errors = validationResult(request);

  if (errors.isEmpty()) {
    response.cookie(cookieNames.AUTHENTICATION, encryptPassword(request.body.password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      secure: config.useHttps,
      httpOnly: true,
      sameSite: 'lax',
    });
    logger.info(`Received successful login request`);
    // Ensure a single slash at the start of processedRedirectUrl to prevent open redirect attacks
    return response.redirect(processedRedirectUrl.replace(/^\/+/, '/'));
  }

  request.flash('errors', errors.array());
  return response.redirect(`${paths.PASSWORD}?returnURL=${encodeURIComponent(processedRedirectUrl)}`);
};

const handleGetPassword = async (request: Request, response: Response) => {
  const returnURL = request.query.returnURL || '/';

  response.render('pages/password', { returnURL, errors: request.flash('errors'), title: 'Sign in' });
};

export default passwordRoutes;
