import express from 'express';
import createError from 'http-errors';

import errorHandler from './errorHandler';
import logger from './logging/logger';
import setupPageVisitAnalytics from './logging/setupPageVisitAnalytics';
import setupRequestLogging from './logging/setupRequestLogging';
import setupAnalytics from './middleware/setupAnalytics';
import setUpCsrf from './middleware/setUpCsrf';
import setUpHealthCheck from './middleware/setUpHealthCheck';
import setupHistory from './middleware/setupHistory';
import setUpi18n from './middleware/setUpi18n';
import setupRateLimit from './middleware/setupRateLimit';
import setUpWebRequestParsing from './middleware/setupRequestParsing';
import setupRobotsTxt from './middleware/setupRobotsTxt';
// import setupServiceNoLongerAvailable from './middleware/setupServiceNoLongerAvailable';
import setUpStaticResources from './middleware/setUpStaticResources';
import setUpWebSecurity from './middleware/setUpWebSecurity';
import setUpWebSession from './middleware/setUpWebSession';
import routes from './routes';
// import unauthenticatedRoutes from './routes/unauthenticatedRoutes';
import nunjucksSetup from './utils/nunjucksSetup';

const createApp = (): express.Application => {
  const app = express();

  app.set('json spaces', 2);
  app.set('trust proxy', true);
  app.set('port', process.env.PORT || 3000);
  // Disable X-Powered-By header for security
  app.disable('x-powered-by');

  app.use(setupRobotsTxt());
  app.use(setUpi18n());
  nunjucksSetup(app);
  app.use(setUpHealthCheck());
  app.use(setUpWebSecurity());
  app.use(setupRateLimit());
  app.use(setUpWebSession());
  app.use(setUpWebRequestParsing());
  app.use(setupPageVisitAnalytics());
  app.use(setupRequestLogging());
  app.use(setUpStaticResources());
  app.use(setUpCsrf());
  app.use(setupAnalytics());
  app.use(setupHistory());
  // app.use(setupServiceNoLongerAvailable());
  // app.use(unauthenticatedRoutes());
  // app.use(setupAuthentication());
  app.use(routes());

  app.use((_request, _response, next) => next(createError(404)));
  app.use(errorHandler());

  return app;
};

const app = createApp();

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`);
});
