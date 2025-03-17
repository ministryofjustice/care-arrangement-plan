import { Router } from 'express';

import whatWillHappenRoutes from './whatWillHappen';

const specialDaysRoutes = (router: Router) => {
  whatWillHappenRoutes(router);
};

export default specialDaysRoutes;
