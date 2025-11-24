import { Router } from 'express';

import paths from '../constants/paths';
import {
  formattedChildrenNames,
  mostlyLiveComplete,
  getBetweenHouseholdsComplete,
  whereHandoverComplete,
  willChangeDuringSchoolHolidaysComplete,
  itemsForChangeoverComplete,
  whatWillHappenComplete,
  whatOtherThingsMatterComplete,
  planLastMinuteChangesComplete,
  planLongTermNoticeComplete,
  planReviewComplete,
} from '../utils/sessionHelpers';
import { checkFormProgressFromConfig } from '../middleware/checkFormProgressFromConfig';
import { FORM_STEPS } from '../constants/formSteps';
import { addCompletedStep } from '../utils/addCompletedStep';

const taskListRoutes = (router: Router) => {
  router.get(paths.TASK_LIST, checkFormProgressFromConfig(FORM_STEPS.TASK_LIST), (request, response) => {
    const isMostlyLiveComplete = mostlyLiveComplete(request.session);
    const isGetBetweenHouseholdsComplete = getBetweenHouseholdsComplete(request.session);
    const isWhereHandoverComplete = whereHandoverComplete(request.session);
    const isWillChangeDuringSchoolHolidaysComplete = willChangeDuringSchoolHolidaysComplete(request.session);
    const isItemsForChangeoverComplete = itemsForChangeoverComplete(request.session);
    const isWhatWillHappenComplete = whatWillHappenComplete(request.session);
    const isWhatOtherThingsMatterComplete = whatOtherThingsMatterComplete(request.session);
    const isPlanLastMinuteChangesComplete = planLastMinuteChangesComplete(request.session);
    const isPlanLongTermNoticeComplete = planLongTermNoticeComplete(request.session);
    const isPlanReviewComplete = planReviewComplete(request.session);

    addCompletedStep(request, FORM_STEPS.TASK_LIST);

    response.render('pages/taskList', {
      title: request.__('taskList.title', { names: formattedChildrenNames(request) }),
      // This should only be true when all tasks are complete
      showContinue:
        isWhatWillHappenComplete &&
        isMostlyLiveComplete &&
        isGetBetweenHouseholdsComplete &&
        isWhereHandoverComplete &&
        isWillChangeDuringSchoolHolidaysComplete &&
        isItemsForChangeoverComplete &&
        isWhatOtherThingsMatterComplete &&
        isPlanLastMinuteChangesComplete &&
        isPlanLongTermNoticeComplete &&
        isPlanReviewComplete,
      mostlyLiveComplete: isMostlyLiveComplete,
      getBetweenHouseholdsComplete: isGetBetweenHouseholdsComplete,
      whereHandoverComplete: isWhereHandoverComplete,
      willChangeDuringSchoolHolidaysComplete: isWillChangeDuringSchoolHolidaysComplete,
      itemsForChangeoverComplete: isItemsForChangeoverComplete,
      whatWillHappenComplete: isWhatWillHappenComplete,
      whatOtherThingsMatterComplete: isWhatOtherThingsMatterComplete,
      planLastMinuteChangesComplete: isPlanLastMinuteChangesComplete,
      planLongTermNoticeComplete: isPlanLongTermNoticeComplete,
      planReviewComplete: isPlanReviewComplete,
    });
  });
};

export default taskListRoutes;
