import { Router } from 'express';

import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../utils/addCompletedStep';
import {
  childHealthComplete,
  childHealthNeedsComplete,
  educationRoutineDecisionsComplete,
  educationSchoolMeetingsComplete,
  educationShareInformationComplete,
  childrenReference,
  formattedChildrenNames,
  getBetweenHouseholdsComplete,
  itemsForChangeoverComplete,
  mostlyLiveComplete,
  travelAbroadComplete,
  travelDocumentsComplete,
  travelInformationComplete,
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
    const isTravelAbroadComplete = travelAbroadComplete(request.session);
    const isTravelDocumentsComplete = travelDocumentsComplete(request.session);
    const isTravelInformationComplete = travelInformationComplete(request.session);
    const isWhatWillHappenComplete = whatWillHappenComplete(request.session);
    const isWhatOtherThingsMatterComplete = whatOtherThingsMatterComplete(request.session);
    const isPlanLastMinuteChangesComplete = planLastMinuteChangesComplete(request.session);
    const isPlanLongTermNoticeComplete = planLongTermNoticeComplete(request.session);
    const isPlanReviewComplete = planReviewComplete(request.session);
    const isChildHealthComplete = childHealthComplete(request.session);
    const isChildHealthNeedsComplete = childHealthNeedsComplete(request.session);
    const isEducationShareInformationComplete = educationShareInformationComplete(request.session);
    const isEducationRoutineDecisionsComplete = educationRoutineDecisionsComplete(request.session);
    const isEducationSchoolMeetingsComplete = educationSchoolMeetingsComplete(request.session);

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
      isChildHealthNeedsComplete &&
      isEducationShareInformationComplete &&
      isEducationRoutineDecisionsComplete &&
      isEducationSchoolMeetingsComplete;

    const childName = childrenReference(request);

    response.render('pages/taskList', {
      title: request.__('taskList.title', { names: formattedChildrenNames(request) }),
      childName,
      numberOfChildren,
      namesOfChildren,
      showContinue: allTasksComplete,
      mostlyLiveComplete: isMostlyLiveComplete,
      getBetweenHouseholdsComplete: isGetBetweenHouseholdsComplete,
      whereHandoverComplete: isWhereHandoverComplete,
      willChangeDuringSchoolHolidaysComplete: isWillChangeDuringSchoolHolidaysComplete,
      itemsForChangeoverComplete: isItemsForChangeoverComplete,
      travelAbroadComplete: isTravelAbroadComplete,
      travelDocumentsComplete: isTravelDocumentsComplete,
      travelInformationComplete: isTravelInformationComplete,
      whatWillHappenComplete: isWhatWillHappenComplete,
      whatOtherThingsMatterComplete: isWhatOtherThingsMatterComplete,
      planLastMinuteChangesComplete: isPlanLastMinuteChangesComplete,
      planLongTermNoticeComplete: isPlanLongTermNoticeComplete,
      planReviewComplete: isPlanReviewComplete,
      childHealthComplete: isChildHealthComplete,
      childHealthNeedsComplete: isChildHealthNeedsComplete,
      educationShareInformationComplete: isEducationShareInformationComplete,
      educationRoutineDecisionsComplete: isEducationRoutineDecisionsComplete,
      educationSchoolMeetingsComplete: isEducationSchoolMeetingsComplete,
    });
  });
};

export default taskListRoutes;
