import { Router } from 'express';

import mostlyLiveRoutes from './mostlyLive';
import whichDaysDaytimeVisitsRoutes from './whichDaysDaytimeVisits';
import whichDaysOvernightRoutes from './whichDaysOvernight';
import whichScheduleRoutes from './whichSchedule';
import willDaytimeVisitsHappenRoutes from './willDaytimeVisitsHappen';
import willOvernightsHappenRoutes from './willOvernightsHappen';

const livingAndVisitingRoutes = (router: Router) => {
  mostlyLiveRoutes(router);
  whichScheduleRoutes(router);
  willOvernightsHappenRoutes(router);
  whichDaysOvernightRoutes(router);
  willDaytimeVisitsHappenRoutes(router);
  whichDaysDaytimeVisitsRoutes(router);
};

export default livingAndVisitingRoutes;
