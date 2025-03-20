import { Router } from 'express';

import planLastMinuteChanges from './planLastMinuteChanges';
import planLongTermNotice from './planLongTermNotice';
import planReview from './planReview';

const decisionMakingRoutes = (router: Router) => {
  planLastMinuteChanges(router);
  planLongTermNotice(router);
  planReview(router);
};

export default decisionMakingRoutes;
