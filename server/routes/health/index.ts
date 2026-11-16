import { Router } from 'express';

import childHealthRoutes from './childHealth';
import childHealthNeedsRoutes from './childHealthNeeds';

const healthRoutes = (router: Router) => {
  childHealthRoutes(router);
  childHealthNeedsRoutes(router);
};

export default healthRoutes;
