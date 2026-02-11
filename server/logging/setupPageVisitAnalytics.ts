import { NextFunction, Request, Response } from 'express';
import onFinished from 'on-finished';

import { logPageVisit } from '../services/analyticsService';

const EXCLUDED_PATHS = ['/health', '/ping', '/manifest.json' ];

const EXCLUDED_PATTERNS = [
  /^\/assets/,
  /^\/images/,
  /^\/js/,
  /^\/fonts/,
  /^\/css/,
  /^\/rebrand/,
  /^\/download/
];


/**
 * Middleware to set up page visit analytics logging.
 */
const setupPageVisitAnalytics = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      const { method, path } = req;
      const { statusCode: responseStatusCode } = res;

      if (method !== 'GET' || responseStatusCode >= 400 ) {
        return;
      }

      if (EXCLUDED_PATHS.includes(path)) {
        return;
      }

      if (EXCLUDED_PATTERNS.some(pattern => pattern.test(path))) {
        return;
      }

      logPageVisit(req, res);
    });

    next();
  };
};

export default setupPageVisitAnalytics;
