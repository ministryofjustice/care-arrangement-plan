import { Router } from 'express';
import i18n from 'i18n';

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
      title: i18n.__('checkYourAnswers.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      values: {
        childrenNames: formattedChildrenNames(request.session),
        adultNames: formatListOfStrings([initialAdultName, secondaryAdultName]),
        parentNotMostlyLivedWith: parentNotMostlyLivedWith(request.session),
        mostlyLive: mostlyLive(request.session),
        whichSchedule: whichSchedule(request.session),
        willOvernightsHappen: willOvernightsHappen(request.session),
        whichDaysOvernight: whichDaysOvernight(request.session),
        willDaytimeVisitsHappen: willDaytimeVisitsHappen(request.session),
        whichDaysDaytimeVisits: whichDaysDaytimeVisits(request.session),
        getBetweenHouseholds: getBetweenHouseholds(request.session),
        whereHandover: whereHandover(request.session),
        willChangeDuringSchoolHolidays: willChangeDuringSchoolHolidays(request.session),
        howChangeDuringSchoolHolidays: howChangeDuringSchoolHolidays(request.session),
        itemsForChangeover: itemsForChangeover(request.session),
        whatWillHappen: whatWillHappen(request.session),
        whatOtherThingsMatter: whatOtherThingsMatter(request.session),
        planLastMinuteChanges: planLastMinuteChanges(request.session),
        planLongTermNotice: planLongTermNotice(request.session),
        planReview: planReview(request.session),
      },
    });
  });
};

export default checkYourAnswersRoutes;
