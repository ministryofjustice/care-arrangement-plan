import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import paths from '../constants/paths';
import { authenticationCookieMatches } from '../utils/encryptPassword';
import { validateRedirectUrl } from '../utils/redirectValidator';

const setupAuthentication = () => {
  const router = Router();

  router.use((req: Request, res: Response, next: NextFunction) => {
    if (!config.useAuth || isAuthenticated(req)) {
      next();
      return;
    }
    if (config.oneLogin.enabled) {
      sendUserToSignIn(req, res);
      return;
    }
    sendUserToPasswordPage(req, res);
  });
  return router;
};

const rememberReturnUrl = (req: Request) => {
  // Keep only an allowlisted path. The redirect target below is a fixed route,
  // so the request URL cannot choose where the browser is sent.
  req.session.returnUrl = validateRedirectUrl(req.originalUrl, paths.START);
};

const sendUserToPasswordPage = (req: Request, res: Response) => {
  rememberReturnUrl(req);
  res.redirect(paths.PASSWORD);
};

const sendUserToSignIn = (req: Request, res: Response) => {
  rememberReturnUrl(req);
  res.redirect(paths.SIGN_IN);
};

const isAuthenticated = (req: Request) => {
  if (config.oneLogin.enabled) {
    return Boolean(req.session?.oneLogin?.sub);
  }

  return authenticationCookieMatches(req.cookies[cookieNames.AUTHENTICATION], config.passwords);
};

export default setupAuthentication;
