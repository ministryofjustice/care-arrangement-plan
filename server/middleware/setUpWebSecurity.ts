import crypto from 'crypto';

import { Router, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

import config from '../config';

const setUpWebSecurity = (): Router => {
  const router = Router();

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, response: Response, next: NextFunction) => {
    response.locals.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
  });
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
          // <script nonce="{{ cspNonce }}">
          // or
          // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
          // This ensures only scripts we trust are loaded, and not anything injected into the
          // page by an attacker.
          scriptSrc: [
            "'self'",
            (_request: Request, reponse: Response) => `'nonce-${reponse.locals.cspNonce}'`,
            'https://*.googletagmanager.com',
          ],
          imgSrc: ["'self'", 'data:', 'https://*.google-analytics.com', 'https://*.googletagmanager.com'],
          connectSrc: [
            'https://*.google-analytics.com',
            'https://*.analytics.google.com',
            'https://*.googletagmanager.com',
          ],
          styleSrc: ["'self'", (_req: Request, response: Response) => `'nonce-${response.locals.cspNonce}'`],
          fontSrc: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: config.useHttps ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: true,
      strictTransportSecurity: config.useHttps,
    }),
  );
  return router;
};

export default setUpWebSecurity;
