import { Router } from 'express';

import consentToTravelRoutes from './consentToTravel';
import getBetweenHouseholdsRoutes from './getBetweenHouseholds';
import howChangeDuringSchoolHolidaysRoutes from './howChangeDuringSchoolHolidays';
import itemsForChangeoverRoutes from './itemsForChangeover';
import travelAbroadRoutes from './travelAbroad';
import travelDocumentsRoutes from './travelDocuments';
import travelInformationRoutes from './travelInformation';
import whereHandoverRoutes from './whereHandover';
import willChangeDuringSchoolHolidaysRoutes from './willChangeDuringSchoolHolidays';

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholdsRoutes(router);
  whereHandoverRoutes(router);
  willChangeDuringSchoolHolidaysRoutes(router);
  howChangeDuringSchoolHolidaysRoutes(router);
  itemsForChangeoverRoutes(router);
  travelAbroadRoutes(router);
  travelDocumentsRoutes(router);
  consentToTravelRoutes(router);
  travelInformationRoutes(router);
};

export default handoverAndHolidaysRoutes;
