import { Router } from 'express';

import planLastMinuteChanges from './planLastMinuteChanges';

const decisionMakingRoutes = (router: Router) => {
  planLastMinuteChanges(router);
};

export default decisionMakingRoutes;
