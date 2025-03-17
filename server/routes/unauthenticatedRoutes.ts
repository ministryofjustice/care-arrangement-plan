import { Router } from 'express';

import accessibilityStatementRoutes from './accessibilityStatment';
import cookiesRoutes from './cookies';
import passwordRoutes from './password';

const routes = (): Router => {
  const router = Router();
  passwordRoutes(router);
  cookiesRoutes(router);
  accessibilityStatementRoutes(router);

  return router;
};

export default routes;
