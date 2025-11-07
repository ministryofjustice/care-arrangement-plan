import type { Response, Request, Router } from 'express-serve-static-core';
import { body, validationResult } from 'express-validator';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import logger from '../logging/logger';
import encryptPassword from '../utils/encryptPassword';
import { validateRedirectUrl } from '../utils/redirectValidator';

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
  // Validate redirect URL against whitelist to prevent open redirect attacks
  const processedRedirectUrl = validateRedirectUrl(providedUrl, paths.START);
  const errors = validationResult(request);

  if (errors.isEmpty()) {
    response.cookie(cookieNames.AUTHENTICATION, encryptPassword(request.body.password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      secure: config.useHttps,
      httpOnly: true,
      sameSite: 'lax',
    });
    logger.info(`Received successful login request`);
    // Safe to redirect: processedRedirectUrl has been validated against whitelist
    return response.redirect(processedRedirectUrl);
  }

  request.flash('errors', errors.array());
  return response.redirect(`${paths.PASSWORD}?returnURL=${encodeURIComponent(processedRedirectUrl)}`);
};

const handleGetPassword = async (request: Request, response: Response) => {
  const providedReturnURL = typeof request.query.returnURL === 'string' ? request.query.returnURL : undefined;
  const returnURL = validateRedirectUrl(providedReturnURL, paths.START);

  response.render('pages/password', { returnURL, errors: request.flash('errors'), title: 'Sign in' });
};

export default passwordRoutes;
