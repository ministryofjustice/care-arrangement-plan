import express, { Express, Router } from 'express';
import createError from 'http-errors';

import errorHandler from '../errorHandler';
import setupAnalytics from '../middleware/setupAnalytics';
import setupAuthentication from '../middleware/setupAuthentication';
import setUpi18n from '../middleware/setUpi18n';
import setUpWebRequestParsing from '../middleware/setupRequestParsing';
import setupServiceNoLongerAvailable from '../middleware/setupServiceNoLongerAvailable';
import routes from '../routes';
import unauthenticatedRoutes from '../routes/unauthenticatedRoutes';
import nunjucksSetup from '../utils/nunjucksSetup';

import { flashMock, sessionMock } from './testMocks';

const testAppSetup = (): Express => {
  const app = express();

  app.use(setUpi18n());
  nunjucksSetup(app);
  app.use((request, _response, next) => {
    request.session = sessionMock;
    request.flash = flashMock;
    next();
  });
  app.use(setUpWebRequestParsing());
  app.use(setupAnalytics());
  app.use(setupServiceNoLongerAvailable());
  app.use(unauthenticatedRoutes());
  app.use(setupAuthentication());
  app.use(routes());

  const testRouter = Router();
  testRouter.get('/create-error', (_request, _response, next) => {
    next(new Error('An error happened!'));
  });
  app.use(testRouter);

  app.use((_request, _response, next) => next(createError(404)));
  app.use(errorHandler());

  return app;
};

export default testAppSetup;
