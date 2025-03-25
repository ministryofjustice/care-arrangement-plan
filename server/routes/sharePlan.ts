import { Router } from 'express';

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
  planLastMinuteChanges,
  planLongTermNotice,
  planReview,
} from '../utils/formattedAnswersForPdf';
import { formattedChildrenNames, parentNotMostlyLivedWith } from '../utils/sessionHelpers';

const sharePlanRoutes = (router: Router) => {
  router.get(paths.SHARE_PLAN, (request, response) => {
    const childrenNames = formattedChildrenNames(request.session);

    response.render('pages/sharePlan', {
      title: request.__('sharePlan.title', { names: childrenNames }),
      values: {
        ...request.session,
        childrenNames,
        parentNotMostlyLivedWith: parentNotMostlyLivedWith(request.session),
        mostlyLiveAnswer: mostlyLive(request),
        whichScheduleAnswer: whichSchedule(request),
        willOvernightsHappenAnswer: willOvernightsHappen(request),
        whichDaysOvernightAnswer: whichDaysOvernight(request),
        willDaytimeVisitsHappenAnswer: willDaytimeVisitsHappen(request),
        whichDaysDaytimeVisitsAnswer: whichDaysDaytimeVisits(request),
        getBetweenHouseholdsAnswer: getBetweenHouseholds(request),
        whereHandoverAnswer: whereHandover(request),
        willChangeDuringSchoolHolidaysAnswer: willChangeDuringSchoolHolidays(request),
        howChangeDuringSchoolHolidaysAnswer: howChangeDuringSchoolHolidays(request),
        itemsForChangeoverAnswer: itemsForChangeover(request),
        whatWillHappenAnswer: whatWillHappen(request),
        whatOtherThingsMatterAnswer: whatOtherThingsMatter(request),
        planLastMinuteChanges: planLastMinuteChanges(request),
        planLongTermNotice: planLongTermNotice(request),
        planReview: planReview(request),
      },
    });
  });
};

export default sharePlanRoutes;
