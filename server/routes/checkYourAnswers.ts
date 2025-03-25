import { Router } from 'express';

import paths from '../constants/paths';
import {
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
  whatWillHappen,
  whatOtherThingsMatter,
  planLastMinuteChanges,
  planLongTermNotice,
  planReview,
} from '../utils/formattedAnswersForCheckAnswers';
import { formatListOfStrings } from '../utils/formValueUtils';
import { formattedChildrenNames, parentNotMostlyLivedWith, getBackUrl } from '../utils/sessionHelpers';

const checkYourAnswersRoutes = (router: Router) => {
  router.get(paths.CHECK_YOUR_ANSWERS, (request, response) => {
    const { initialAdultName, secondaryAdultName } = request.session;

    response.render('pages/checkYourAnswers', {
      title: request.__('checkYourAnswers.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      values: {
        childrenNames: formattedChildrenNames(request.session),
        adultNames: formatListOfStrings([initialAdultName, secondaryAdultName]),
        parentNotMostlyLivedWith: parentNotMostlyLivedWith(request.session),
        mostlyLive: mostlyLive(request),
        whichSchedule: whichSchedule(request),
        willOvernightsHappen: willOvernightsHappen(request),
        whichDaysOvernight: whichDaysOvernight(request),
        willDaytimeVisitsHappen: willDaytimeVisitsHappen(request),
        whichDaysDaytimeVisits: whichDaysDaytimeVisits(request),
        getBetweenHouseholds: getBetweenHouseholds(request),
        whereHandover: whereHandover(request),
        willChangeDuringSchoolHolidays: willChangeDuringSchoolHolidays(request),
        howChangeDuringSchoolHolidays: howChangeDuringSchoolHolidays(request),
        itemsForChangeover: itemsForChangeover(request),
        whatWillHappen: whatWillHappen(request),
        whatOtherThingsMatter: whatOtherThingsMatter(request),
        planLastMinuteChanges: planLastMinuteChanges(request),
        planLongTermNotice: planLongTermNotice(request),
        planReview: planReview(request),
      },
    });
  });
};

export default checkYourAnswersRoutes;
