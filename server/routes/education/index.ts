import { Router } from 'express';

import shareInformationRoutes from './shareInformation';
import routineDecisionsRoutes from './routineDecisions';
import schoolMeetingsRoutes from './schoolMeetings';

const educationRoutes = (router: Router) => {
  shareInformationRoutes(router);
  routineDecisionsRoutes(router);
  schoolMeetingsRoutes(router);
};

export default educationRoutes;
