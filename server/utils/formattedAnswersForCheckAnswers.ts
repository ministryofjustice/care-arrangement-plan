import { Request } from 'express';

import { whereHandoverField } from '../@types/fields';

import { formatPlanChangesOptionsIntoList, formatWhichDaysSessionValue } from './formValueUtils';
import { parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers';

export const mostlyLive = (request: Request) => {
  const { livingAndVisiting, initialAdultName, secondaryAdultName } = request.session;
  if (!livingAndVisiting.mostlyLive) return undefined;
  switch (livingAndVisiting.mostlyLive.where) {
    case 'withInitial':
    case 'withSecondary':
      return request.__('livingAndVisiting.mostlyLive.with', { adult: parentMostlyLivedWith(request.session) });
    case 'split':
      return request.__('livingAndVisiting.mostlyLive.split', {
        initialAdult: initialAdultName,
        secondaryAdult: secondaryAdultName,
      });
    case 'other':
      return livingAndVisiting.mostlyLive.describeArrangement;
    default:
      return undefined;
  }
};

export const whichSchedule = (request: Request) => {
  const { livingAndVisiting } = request.session;
  if (!livingAndVisiting.whichSchedule) return undefined;
  return livingAndVisiting.whichSchedule.noDecisionRequired
    ? request.__('doNotNeedToDecide')
    : livingAndVisiting.whichSchedule.answer;
};

export const willOvernightsHappen = (request: Request) => {
  const { livingAndVisiting } = request.session;
  if (!livingAndVisiting.overnightVisits) return undefined;
  return livingAndVisiting.overnightVisits.willHappen ? request.__('yes') : request.__('no');
};

export const whichDaysOvernight = (request: Request) => {
  const { livingAndVisiting } = request.session;
  if (!livingAndVisiting.overnightVisits?.whichDays) return undefined;
  if (livingAndVisiting.overnightVisits.whichDays.describeArrangement) {
    return livingAndVisiting.overnightVisits.whichDays.describeArrangement;
  }
  if (livingAndVisiting.overnightVisits.whichDays.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  return request.__('checkYourAnswers.livingAndVisiting.whichDaysOvernight', {
    adult: parentNotMostlyLivedWith(request.session),
    days: formatWhichDaysSessionValue(livingAndVisiting.overnightVisits.whichDays, request),
  });
};

export const willDaytimeVisitsHappen = (request: Request) => {
  const { livingAndVisiting } = request.session;
  if (!livingAndVisiting.daytimeVisits) return undefined;
  return livingAndVisiting.daytimeVisits.willHappen ? request.__('yes') : request.__('no');
};

export const whichDaysDaytimeVisits = (request: Request) => {
  const { livingAndVisiting } = request.session;
  if (!livingAndVisiting.daytimeVisits?.whichDays) return undefined;
  if (livingAndVisiting.daytimeVisits.whichDays.describeArrangement) {
    return livingAndVisiting.daytimeVisits?.whichDays.describeArrangement;
  }
  if (livingAndVisiting.daytimeVisits?.whichDays.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  return request.__('checkYourAnswers.livingAndVisiting.whichDaysDaytimeVisits', {
    adult: parentNotMostlyLivedWith(request.session),
    days: formatWhichDaysSessionValue(livingAndVisiting.daytimeVisits.whichDays, request),
  });
};

export const getBetweenHouseholds = (request: Request) => {
  const { handoverAndHolidays, initialAdultName, secondaryAdultName } = request.session;
  if (handoverAndHolidays.getBetweenHouseholds.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  switch (handoverAndHolidays.getBetweenHouseholds.how) {
    case 'initialCollects':
      return request.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', { adult: initialAdultName });
    case 'secondaryCollects':
      return request.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', { adult: secondaryAdultName });
    case 'other':
      return handoverAndHolidays.getBetweenHouseholds.describeArrangement;
    default:
      return undefined;
  }
};

export const whereHandover = (request: Request) => {
  const { handoverAndHolidays, initialAdultName, secondaryAdultName } = request.session;
  if (handoverAndHolidays.whereHandover.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const getAnswerForWhereHandoverWhere = (where: whereHandoverField) => {
    switch (where) {
      case 'neutral':
        return request.__('handoverAndHolidays.whereHandover.neutralLocation');
      case 'initialHome':
        return request.__('handoverAndHolidays.whereHandover.atHome', { adult: initialAdultName });
      case 'secondaryHome':
        return request.__('handoverAndHolidays.whereHandover.atHome', { adult: secondaryAdultName });
      case 'school':
        return request.__('handoverAndHolidays.whereHandover.atSchool');
      case 'someoneElse':
        return handoverAndHolidays.whereHandover.someoneElse;
      default:
        return undefined;
    }
  };

  return handoverAndHolidays.whereHandover.where.map(getAnswerForWhereHandoverWhere).join(', ');
};

export const willChangeDuringSchoolHolidays = (request: Request) => {
  const { handoverAndHolidays } = request.session;
  if (handoverAndHolidays.willChangeDuringSchoolHolidays.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  return handoverAndHolidays.willChangeDuringSchoolHolidays.willChange ? request.__('yes') : request.__('no');
};

export const howChangeDuringSchoolHolidays = (request: Request) => {
  const { handoverAndHolidays } = request.session;
  if (!handoverAndHolidays.howChangeDuringSchoolHolidays) return undefined;

  return handoverAndHolidays.howChangeDuringSchoolHolidays.noDecisionRequired
    ? request.__('doNotNeedToDecide')
    : handoverAndHolidays.howChangeDuringSchoolHolidays.answer;
};

export const itemsForChangeover = (request: Request) => {
  const { handoverAndHolidays } = request.session;
  return handoverAndHolidays.itemsForChangeover.noDecisionRequired
    ? request.__('doNotNeedToDecide')
    : handoverAndHolidays.itemsForChangeover.answer;
};

export const whatWillHappen = (request: Request) => {
  const { specialDays } = request.session;
  return specialDays.whatWillHappen.noDecisionRequired
    ? request.__('doNotNeedToDecide')
    : specialDays.whatWillHappen.answer;
};

export const whatOtherThingsMatter = (request: Request) => {
  const { otherThings } = request.session;
  return otherThings.whatOtherThingsMatter.noDecisionRequired
    ? request.__('doNotNeedToDecide')
    : otherThings.whatOtherThingsMatter.answer;
};

export const planLastMinuteChanges = (request: Request) => {
  const { decisionMaking } = request.session;
  if (decisionMaking.planLastMinuteChanges.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  if (decisionMaking.planLastMinuteChanges.anotherArrangementDescription) {
    return decisionMaking.planLastMinuteChanges.anotherArrangementDescription;
  }
  const planLastMinuteChangeList = formatPlanChangesOptionsIntoList(request);
  return planLastMinuteChangeList.charAt(0).toUpperCase() + String(planLastMinuteChangeList).slice(1);
};

export const planLongTermNotice = (request: Request) => {
  const { decisionMaking } = request.session;
  if (decisionMaking.planLongTermNotice.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  if (decisionMaking.planLongTermNotice.otherAnswer) {
    return decisionMaking.planLongTermNotice.otherAnswer;
  }
  return request.__('decisionMaking.planLongTermNotice.weeks', {
    number: decisionMaking.planLongTermNotice.weeks.toString(),
  });
};

export const planReview = (request: Request) => {
  const { decisionMaking } = request.session;
  let number: number;
  let translationName: string;

  if (decisionMaking.planReview.months) {
    number = decisionMaking.planReview.months;
    translationName = 'checkYourAnswers.decisionMaking.months';
  } else {
    number = decisionMaking.planReview.years;
    translationName = 'checkYourAnswers.decisionMaking.years';
  }

  const translationSuffix = number === 1 ? 'Singular' : 'Plural';

  return request.__(translationName + translationSuffix, { number: number.toString() });
};
