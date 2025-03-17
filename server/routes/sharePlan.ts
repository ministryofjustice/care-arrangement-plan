import { Router } from 'express';
import i18n from 'i18n';

import paths from '../constants/paths';
import {
  whatWillHappen,
  mostlyLive,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
  whatOtherThingsMatter,
} from '../utils/formattedAnswersForPdf';
import { formattedChildrenNames, parentNotMostlyLivedWith } from '../utils/sessionHelpers';

const sharePlanRoutes = (router: Router) => {
  router.get(paths.SHARE_PLAN, (request, response) => {
    const childrenNames = formattedChildrenNames(request.session);

    response.render('pages/sharePlan', {
      title: `${i18n.__('sharePlan.title', { names: childrenNames })}`,
      values: {
        ...request.session,
        childrenNames,
        parentNotMostlyLivedWith: parentNotMostlyLivedWith(request.session),
        mostlyLiveAnswer: mostlyLive(request.session),
        whichScheduleAnswer: whichSchedule(request.session),
        willOvernightsHappenAnswer: willOvernightsHappen(request.session),
        whichDaysOvernightAnswer: whichDaysOvernight(request.session),
        willDaytimeVisitsHappenAnswer: willDaytimeVisitsHappen(request.session),
        whichDaysDaytimeVisitsAnswer: whichDaysDaytimeVisits(request.session),
        getBetweenHouseholdsAnswer: getBetweenHouseholds(request.session),
        whereHandoverAnswer: whereHandover(request.session),
        willChangeDuringSchoolHolidaysAnswer: willChangeDuringSchoolHolidays(request.session),
        howChangeDuringSchoolHolidaysAnswer: howChangeDuringSchoolHolidays(request.session),
        itemsForChangeoverAnswer: itemsForChangeover(request.session),
        whatWillHappenAnswer: whatWillHappen(request.session),
        whatOtherThingsMatterAnswer: whatOtherThingsMatter(request.session),
      },
    });
  });
};

export default sharePlanRoutes;
