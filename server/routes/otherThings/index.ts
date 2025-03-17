import { Router } from 'express';

import whatOtherThingsMatterRoutes from './whatOtherThingsMatter';

const otherThingsRoutes = (router: Router) => {
  whatOtherThingsMatterRoutes(router);
};

export default otherThingsRoutes;
