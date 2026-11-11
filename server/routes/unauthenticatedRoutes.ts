import { Router } from 'express';

import accessibilityStatementRoutes from './accessibilityStatement';
import accountRoutes from './account';
import contactUsRoutes from './contactUs';
import cookiesRoutes from './cookies';
import passwordRoutes from './password';
import privacyNoticeRoutes from './privacyNotice';
import sessionTimeoutRoutes from './sessionTimeout';
import termsAndConditionsRoutes from './termsAndConditions';

const routes = (): Router => {
  const router = Router();
  passwordRoutes(router);
  accountRoutes(router);
  cookiesRoutes(router);
  accessibilityStatementRoutes(router);
  contactUsRoutes(router);
  privacyNoticeRoutes(router);
  sessionTimeoutRoutes(router);
  termsAndConditionsRoutes(router);

  return router;
};

export default routes;
