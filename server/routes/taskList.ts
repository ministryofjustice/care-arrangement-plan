import { Router } from 'express';

import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../utils/addCompletedStep';
import {
  childHealthComplete,
  childHealthNeedsComplete,
  formattedChildrenNames,
  getBetweenHouseholdsComplete,
  itemsForChangeoverComplete,
  mostlyLiveComplete,
  planLastMinuteChangesComplete,
  planLongTermNoticeComplete,
  planReviewComplete,
  whatOtherThingsMatterComplete,
  whatWillHappenComplete,
  whereHandoverComplete,
  willChangeDuringSchoolHolidaysComplete,
} from '../utils/sessionHelpers';

const taskListRoutes = (router: Router) => {
  router.get(paths.TASK_LIST, checkFormProgressFromConfig(FORM_STEPS.TASK_LIST), (request, response) => {
    const { numberOfChildren, namesOfChildren } = request.session;

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
    const isChildHealthComplete = childHealthComplete(request.session);
    const isChildHealthNeedsComplete = childHealthNeedsComplete(request.session);

    addCompletedStep(request, FORM_STEPS.TASK_LIST);

    const allTasksComplete =
      isWhatWillHappenComplete &&
      isMostlyLiveComplete &&
      isGetBetweenHouseholdsComplete &&
      isWhereHandoverComplete &&
      isWillChangeDuringSchoolHolidaysComplete &&
      isItemsForChangeoverComplete &&
      isWhatOtherThingsMatterComplete &&
      isPlanLastMinuteChangesComplete &&
      isPlanLongTermNoticeComplete &&
      isPlanReviewComplete &&
      isChildHealthComplete &&
      isChildHealthNeedsComplete;

    const childName = formattedChildrenNames(request);

    response.render('pages/taskList', {
      title: request.__('taskList.title', { names: childName }),
      childName,
      numberOfChildren,
      namesOfChildren,
      showContinue: allTasksComplete,
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
      childHealthComplete: isChildHealthComplete,
      childHealthNeedsComplete: isChildHealthNeedsComplete,
    });
  });
};

export default taskListRoutes;
