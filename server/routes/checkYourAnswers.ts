import { Router } from 'express';

import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig  from '../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../utils/addCompletedStep';
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
  router.get(paths.CHECK_YOUR_ANSWERS, checkFormProgressFromConfig(FORM_STEPS.CHECK_YOUR_ANSWERS), (request, response) => {
    const { initialAdultName, secondaryAdultName } = request.session;

    addCompletedStep(request, FORM_STEPS.CHECK_YOUR_ANSWERS);
    response.render('pages/checkYourAnswers', {
      title: request.__('checkYourAnswers.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      values: {
        childrenNames: formattedChildrenNames(request),
        adultNames: formatListOfStrings([initialAdultName, secondaryAdultName], request),
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
