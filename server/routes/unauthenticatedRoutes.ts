import { Router } from 'express';

import cookiesRoutes from './cookies';
import passwordRoutes from './password';

const routes = (): Router => {
  const router = Router();
  passwordRoutes(router);
  cookiesRoutes(router);

  return router;
};

export default routes;
