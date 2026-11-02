import { Router } from 'express';

import routineDecisionsRoutes from './routineDecisions';
import schoolMeetingsRoutes from './schoolMeetings';
import shareInformationRoutes from './shareInformation';

const educationRoutes = (router: Router) => {
  shareInformationRoutes(router);
  routineDecisionsRoutes(router);
  schoolMeetingsRoutes(router);
};

export default educationRoutes;
