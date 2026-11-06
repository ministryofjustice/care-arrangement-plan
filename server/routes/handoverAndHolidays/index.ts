import { Router } from 'express';

import consentToTravelRoutes from './consentToTravel';
import getBetweenHouseholdsRoutes from './getBetweenHouseholds';
import howChangeDuringSchoolHolidaysRoutes from './howChangeDuringSchoolHolidays';
import itemsForChangeoverRoutes from './itemsForChangeover';
import whereHandoverRoutes from './whereHandover';
import willChangeDuringSchoolHolidaysRoutes from './willChangeDuringSchoolHolidays';

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholdsRoutes(router);
  whereHandoverRoutes(router);
  willChangeDuringSchoolHolidaysRoutes(router);
  howChangeDuringSchoolHolidaysRoutes(router);
  itemsForChangeoverRoutes(router);
  consentToTravelRoutes(router);
};

export default handoverAndHolidaysRoutes;
