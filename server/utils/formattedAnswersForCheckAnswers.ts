/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';

import { whereHandoverField } from '../@types/fields';

import { formatPlanChangesOptionsIntoList, formatWhichDaysSessionValue } from './formValueUtils';
import { getSessionValue } from './perChildSession';
import { parentNotMostlyLivedWith } from './sessionHelpers';

export type PerChildFormattedAnswer = {
  defaultAnswer: string;
  perChildAnswers?: { childName: string; answer: string }[];
};

export const mostlyLive = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { initialAdultName, secondaryAdultName, namesOfChildren } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.mostlyLive) return undefined;

  const data = livingAndVisiting.mostlyLive;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer?.where) return undefined;
    switch (answer.where) {
      case 'withInitial':
        return request.__('livingAndVisiting.mostlyLive.with', { adult: initialAdultName });
      case 'withSecondary':
        return request.__('livingAndVisiting.mostlyLive.with', { adult: secondaryAdultName });
      case 'split':
        return request.__('livingAndVisiting.mostlyLive.split', {
          initialAdult: initialAdultName,
          secondaryAdult: secondaryAdultName,
        });
      case 'other':
        return answer.describeArrangement;
      default:
        return undefined;
    }
  };

  // Handle legacy format (direct answer without default wrapper)
  if (data.where !== undefined && data.default === undefined) {
    return formatAnswer(data);
  }

  // Handle new PerChildAnswer format
  const defaultAnswer = formatAnswer(data.default) || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.where)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: formatAnswer(answer) || '',
    }))
    .filter(item => item.answer);

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const whichSchedule = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { namesOfChildren } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.whichSchedule) return undefined;

  const data = livingAndVisiting.whichSchedule;

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired ? request.__('doNotNeedToDecide') : data.answer;
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const defaultAnswer = data.default?.answer || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: answer.answer!,
    }));

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const willOvernightsHappen = (request: Request) => {
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.overnightVisits) return undefined;
  return livingAndVisiting.overnightVisits.willHappen ? request.__('yes') : request.__('no');
};

export const whichDaysOvernight = (request: Request) => {
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.overnightVisits?.whichDays) return undefined;
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
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.daytimeVisits) return undefined;
  return livingAndVisiting.daytimeVisits.willHappen ? request.__('yes') : request.__('no');
};

export const whichDaysDaytimeVisits = (request: Request) => {
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.daytimeVisits?.whichDays) return undefined;
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

export const getBetweenHouseholds = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { initialAdultName, secondaryAdultName, namesOfChildren } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.getBetweenHouseholds) return undefined;

  const data = handoverAndHolidays.getBetweenHouseholds;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer) return undefined;
    if (answer.noDecisionRequired) {
      return request.__('doNotNeedToDecide');
    }
    switch (answer.how) {
      case 'initialCollects':
        return request.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', { adult: initialAdultName });
      case 'secondaryCollects':
        return request.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', { adult: secondaryAdultName });
      case 'other':
        return answer.describeArrangement;
      default:
        return undefined;
    }
  };

  // Handle legacy format (direct answer without default wrapper)
  if (data.how !== undefined && data.default === undefined) {
    return formatAnswer(data);
  }

  // Handle new PerChildAnswer format
  const defaultAnswer = formatAnswer(data.default) || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.how || answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: formatAnswer(answer) || '',
    }))
    .filter(item => item.answer);

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const whereHandover = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { initialAdultName, secondaryAdultName, namesOfChildren } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.whereHandover) return undefined;

  const data = handoverAndHolidays.whereHandover;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer) return undefined;
    if (answer.noDecisionRequired) {
      return request.__('doNotNeedToDecide');
    }
    if (!answer.where) return undefined;

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
          return answer.someoneElse;
        case 'other':
          return answer.other;
        default:
          return undefined;
      }
    };

    return answer.where.map(getAnswerForWhereHandoverWhere).join(', ');
  };

  // Handle legacy format (direct answer without default wrapper)
  if (data.where !== undefined && data.default === undefined) {
    return formatAnswer(data);
  }

  // Handle new PerChildAnswer format
  const defaultAnswer = formatAnswer(data.default) || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.where || answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: formatAnswer(answer) || '',
    }))
    .filter(item => item.answer);

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const willChangeDuringSchoolHolidays = (request: Request) => {
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.willChangeDuringSchoolHolidays) return undefined;

  const data = handoverAndHolidays.willChangeDuringSchoolHolidays;

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired ? request.__('doNotNeedToDecide') : (data.willChange ? request.__('yes') : request.__('no'));
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  // For per-child answers, check if ANY child will have changes
  const defaultWillChange = data.default?.willChange || false;
  const anyChildWillChange = data.byChild
    ? Object.values(data.byChild).some((child: any) => child.willChange)
    : false;

  return (defaultWillChange || anyChildWillChange) ? request.__('yes') : request.__('no');
};

export const howChangeDuringSchoolHolidays = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { handoverAndHolidays, namesOfChildren } = request.session;
  if (!handoverAndHolidays.howChangeDuringSchoolHolidays) return undefined;

  const data = handoverAndHolidays.howChangeDuringSchoolHolidays;

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const defaultAnswer = data.default?.answer || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]) => answer.answer && !answer.noDecisionRequired)
    .map(([childIndex, answer]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: answer.answer!,
    }));

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const itemsForChangeover = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { namesOfChildren } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.itemsForChangeover) return undefined;

  const data = handoverAndHolidays.itemsForChangeover;

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired ? request.__('doNotNeedToDecide') : data.answer;
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const defaultAnswer = data.default?.answer || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: answer.answer!,
    }));

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const whatWillHappen = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { namesOfChildren } = request.session;
  const specialDays = getSessionValue<any>(request.session, 'specialDays');
  if (!specialDays?.whatWillHappen) return undefined;

  const data = specialDays.whatWillHappen;

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired ? request.__('doNotNeedToDecide') : data.answer;
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const defaultAnswer = data.default?.answer || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: answer.answer!,
    }));

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const whatOtherThingsMatter = (request: Request): string | PerChildFormattedAnswer | undefined => {
  const { namesOfChildren } = request.session;
  const otherThings = getSessionValue<any>(request.session, 'otherThings');
  if (!otherThings?.whatOtherThingsMatter) return undefined;

  const data = otherThings.whatOtherThingsMatter;

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired ? request.__('doNotNeedToDecide') : data.answer;
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const defaultAnswer = data.default?.answer || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: answer.answer!,
    }));

  return {
    defaultAnswer,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const planLastMinuteChanges = (request: Request) => {
  const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
  if (!decisionMaking?.planLastMinuteChanges) return undefined;
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
  const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
  if (!decisionMaking?.planLongTermNotice) return undefined;
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
  const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
  if (!decisionMaking?.planReview) return undefined;
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
