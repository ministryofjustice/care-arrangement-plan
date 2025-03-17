import { Router } from 'express';

import accessibilityStatementRoutes from './accessibilityStatment';
import contactUsRoutes from './contactUs';
import cookiesRoutes from './cookies';
import passwordRoutes from './password';
import privacyNoticeRoutes from './privacyNotice';

const routes = (): Router => {
  const router = Router();
  passwordRoutes(router);
  cookiesRoutes(router);
  accessibilityStatementRoutes(router);
  contactUsRoutes(router);
  privacyNoticeRoutes(router);

  return router;
};

export default routes;
