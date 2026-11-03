import { Request } from 'express';
import { SessionData } from 'express-session';

import { CAPSession } from '../@types/session';

import { formatListOfStrings } from './formValueUtils';
import { validateRedirectUrl } from './redirectValidator';

export const formattedChildrenNames = (request: Request) =>
  formatListOfStrings(request.session.namesOfChildren, request);

export const parentMostlyLivedWith = (session: Partial<CAPSession>) =>
  session.livingAndVisiting.mostlyLive.where === 'withInitial' ? session.initialAdultName : session.secondaryAdultName;

export const parentNotMostlyLivedWith = (session: Partial<CAPSession>) =>
  session.livingAndVisiting.mostlyLive.where === 'withInitial' ? session.initialAdultName : session.secondaryAdultName;

export const mostlyLiveComplete = (session: Partial<CAPSession>) => {
  if (!session.livingAndVisiting?.mostlyLive) return false;

  const { mostlyLive, overnightVisits, daytimeVisits, whichSchedule } = session.livingAndVisiting;

  if (mostlyLive.where === 'other') {
    return true;
  }
  if (mostlyLive.where === 'split') {
    return !!whichSchedule;
  }

  const overnightComplete =
    overnightVisits?.willHappen !== undefined && (!overnightVisits.willHappen || !!overnightVisits.whichDays);
  const daytimeVisitsComplete =
    daytimeVisits?.willHappen !== undefined && (!daytimeVisits.willHappen || !!daytimeVisits.whichDays);
  return overnightComplete && daytimeVisitsComplete;
};

export const getBetweenHouseholdsComplete = (session: Partial<CAPSession>) =>
  !!session.handoverAndHolidays?.getBetweenHouseholds;

export const whereHandoverComplete = (session: Partial<CAPSession>) => !!session.handoverAndHolidays?.whereHandover;

export const willChangeDuringSchoolHolidaysComplete = ({ handoverAndHolidays }: Partial<CAPSession>) => {
  if (!handoverAndHolidays?.willChangeDuringSchoolHolidays) return false;

  return !(
    handoverAndHolidays.willChangeDuringSchoolHolidays.willChange && !handoverAndHolidays.howChangeDuringSchoolHolidays
  );
};

export const itemsForChangeoverComplete = (session: Partial<CAPSession>) =>
  !!session.handoverAndHolidays?.itemsForChangeover;

export const whatWillHappenComplete = (session: Partial<CAPSession>) => !!session.specialDays?.whatWillHappen;

export const whatOtherThingsMatterComplete = (session: Partial<CAPSession>) =>
  !!session.otherThings?.whatOtherThingsMatter;

export const planLastMinuteChangesComplete = (session: Partial<CAPSession>) =>
  !!session.decisionMaking?.planLastMinuteChanges;

export const planLongTermNoticeComplete = (session: Partial<CAPSession>) =>
  !!session.decisionMaking?.planLongTermNotice;

export const educationShareInformationComplete = (session: Partial<CAPSession>) =>
  !!session.education?.shareInformation?.noDecisionRequired ||
  !!session.education?.shareInformation?.options?.length;

export const educationRoutineDecisionsComplete = (session: Partial<CAPSession>) =>
  !!session.education?.routineDecisions?.noDecisionRequired ||
  !!session.education?.routineDecisions?.options?.length;

export const educationSchoolMeetingsComplete = (session: Partial<CAPSession>) =>
  !!session.education?.schoolMeetings?.noDecisionRequired ||
  !!session.education?.schoolMeetings?.options?.length;

export const childHealthComplete = (session: Partial<CAPSession>) =>
  !!session.childHealth?.routineDecisions?.noDecisionRequired || !!session.childHealth?.routineDecisions?.options?.length;

export const childHealthNeedsComplete = (session: Partial<CAPSession>) =>
  !!session.childHealth?.childHealthNeeds?.noDecisionRequired ||
  !!session.childHealth?.childHealthNeeds?.description ||
  !!session.childHealth?.childHealthNeeds?.description?.trim().length;

export const planReviewComplete = (session: Partial<CAPSession>) => !!session.decisionMaking?.planReview;

export const getBackUrl = (session: Partial<SessionData>, defaultUrl: string) => {
  if (!session.previousPage) {
    return defaultUrl;
  }
  return validateRedirectUrl(session.previousPage, defaultUrl);
};

export const getRedirectUrlAfterFormSubmit = (session: Partial<SessionData>, defaultUrl: string) => {
  // If the user came directly from check answers page, redirect back there
  const previousPage = session.previousPage;
  if (previousPage === '/check-your-answers') {
    return validateRedirectUrl(previousPage, defaultUrl);
  }
  // defaultUrl is already from paths enum, so it's safe
  return defaultUrl;
};
