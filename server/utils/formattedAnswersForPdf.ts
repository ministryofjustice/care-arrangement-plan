import { Request } from 'express';

import { whereHandoverField } from '../@types/fields';

import { formatListOfStrings, formatPlanChangesOptionsIntoList, formatWhichDaysSessionValue } from './formValueUtils';
import { getSessionValue } from './perChildSession';
import { parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers';

export type PerChildFormattedAnswerForPdf = {
  defaultAnswer: string;
  perChildAnswers?: { childName: string; answer: string }[];
};

export const mostlyLive = (request: Request): string | PerChildFormattedAnswerForPdf | undefined => {
  const { initialAdultName, secondaryAdultName, namesOfChildren } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.mostlyLive) return undefined;

  const data = livingAndVisiting.mostlyLive;

  // Helper to format a single answer for PDF
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer?.where) return undefined;
    switch (answer.where) {
      case 'withInitial':
        return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedLiveWith', {
          senderName: initialAdultName,
          adult: initialAdultName,
        });
      case 'withSecondary':
        return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedLiveWith', {
          senderName: initialAdultName,
          adult: secondaryAdultName,
        });
      case 'split':
        return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedSplit', {
          senderName: initialAdultName,
          otherAdult: secondaryAdultName,
        });
      case 'other':
        return request.__('sharePlan.yourProposedPlan.senderSuggested', {
          senderName: initialAdultName,
          suggestion: answer.describeArrangement,
        });
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

export const whichSchedule = (request: Request): string | PerChildFormattedAnswerForPdf | undefined => {
  const { initialAdultName, namesOfChildren } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.whichSchedule) return undefined;

  const data = livingAndVisiting.whichSchedule;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer) return undefined;
    if (answer.noDecisionRequired) {
      return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
    }
    if (answer.answer) {
      return request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: answer.answer,
      });
    }
    return undefined;
  };

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired
      ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
      : request.__('sharePlan.yourProposedPlan.senderSuggested', {
          senderName: initialAdultName,
          suggestion: data.answer,
        });
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const defaultAnswer = formatAnswer(data.default) || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
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

export const willOvernightsHappen = (request: Request) => {
  const { initialAdultName } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.overnightVisits) return undefined;
  return livingAndVisiting.overnightVisits.willHappen
    ? request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedStayOvernight', {
        senderName: initialAdultName,
        adult: parentNotMostlyLivedWith(request.session),
      })
    : request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedNoOvernights', {
        senderName: initialAdultName,
      });
};

export const whichDaysOvernight = (request: Request) => {
  const { initialAdultName } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.overnightVisits?.whichDays) return undefined;
  if (livingAndVisiting.overnightVisits.whichDays.describeArrangement) {
    return request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion: livingAndVisiting.overnightVisits.whichDays.describeArrangement,
    });
  }
  if (livingAndVisiting.overnightVisits.whichDays.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedOvernightDays', {
    senderName: initialAdultName,
    days: formatWhichDaysSessionValue(livingAndVisiting.overnightVisits.whichDays, request),
  });
};

export const willDaytimeVisitsHappen = (request: Request) => {
  const { initialAdultName } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.daytimeVisits) return undefined;
  return livingAndVisiting.daytimeVisits.willHappen
    ? request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedDaytimeVisits', {
        senderName: initialAdultName,
        adult: parentNotMostlyLivedWith(request.session),
      })
    : request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedNoDaytimeVisits', {
        senderName: initialAdultName,
      });
};

export const whichDaysDaytimeVisits = (request: Request) => {
  const { initialAdultName } = request.session;
  const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
  if (!livingAndVisiting?.daytimeVisits?.whichDays) return undefined;
  if (livingAndVisiting.daytimeVisits.whichDays.describeArrangement) {
    return request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion: livingAndVisiting.daytimeVisits.whichDays.describeArrangement,
    });
  }
  if (livingAndVisiting.daytimeVisits?.whichDays.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedDaytimeVisitDays', {
    senderName: initialAdultName,
    days: formatWhichDaysSessionValue(livingAndVisiting.daytimeVisits.whichDays, request),
  });
};

export const getBetweenHouseholds = (request: Request): string | PerChildFormattedAnswerForPdf | undefined => {
  const { initialAdultName, secondaryAdultName, namesOfChildren } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.getBetweenHouseholds) return undefined;

  const data = handoverAndHolidays.getBetweenHouseholds;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer) return undefined;
    if (answer.noDecisionRequired) {
      return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
    }
    switch (answer.how) {
      case 'initialCollects':
        return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedCollects', {
          senderName: initialAdultName,
          adult: initialAdultName,
        });
      case 'secondaryCollects':
        return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedCollects', {
          senderName: initialAdultName,
          adult: secondaryAdultName,
        });
      case 'other':
        return request.__('sharePlan.yourProposedPlan.senderSuggested', {
          senderName: initialAdultName,
          suggestion: answer.describeArrangement,
        });
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

export const whereHandover = (request: Request): string | PerChildFormattedAnswerForPdf | undefined => {
  const { initialAdultName, secondaryAdultName, namesOfChildren } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.whereHandover) return undefined;

  const data = handoverAndHolidays.whereHandover;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer) return undefined;
    if (answer.noDecisionRequired) {
      return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
    }

    if (answer.someoneElse) {
      return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedSomeoneElse', {
        senderName: initialAdultName,
        someoneElse: answer.someoneElse,
      });
    }

    if (!answer.where) return undefined;

    const getAnswerForWhereHandoverWhere = (where: whereHandoverField) => {
      switch (where) {
        case 'neutral':
          return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.neutralLocation');
        case 'initialHome':
          return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.home', { adult: initialAdultName });
        case 'secondaryHome':
          return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.home', { adult: secondaryAdultName });
        case 'school':
          return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.school');
        default:
          return undefined;
      }
    };

    return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedHandover', {
      senderName: initialAdultName,
      location: formatListOfStrings(answer.where.map(getAnswerForWhereHandoverWhere), request),
    });
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
  const { initialAdultName } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.willChangeDuringSchoolHolidays) return undefined;
  if (handoverAndHolidays.willChangeDuringSchoolHolidays.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }
  return handoverAndHolidays.willChangeDuringSchoolHolidays.willChange
    ? request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedChangeDuringSchoolHolidays', {
        senderName: initialAdultName,
      })
    : request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedNoChangeDuringSchoolHolidays', {
        senderName: initialAdultName,
      });
};

export const howChangeDuringSchoolHolidays = (request: Request): string | PerChildFormattedAnswerForPdf | undefined => {
  const { initialAdultName, namesOfChildren } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.howChangeDuringSchoolHolidays) return undefined;

  const data = handoverAndHolidays.howChangeDuringSchoolHolidays;

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const defaultSuggestion = request.__('sharePlan.yourProposedPlan.senderSuggested', {
    senderName: initialAdultName,
    suggestion: data.default?.answer || '',
  });

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultSuggestion;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
    .map(([childIndex, answer]: [string, any]) => ({
      childName: namesOfChildren[parseInt(childIndex, 10)] || `Child ${parseInt(childIndex, 10) + 1}`,
      answer: request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: answer.answer!,
      }),
    }));

  return {
    defaultAnswer: defaultSuggestion,
    perChildAnswers: perChildAnswers.length > 0 ? perChildAnswers : undefined,
  };
};

export const itemsForChangeover = (request: Request) => {
  const { initialAdultName } = request.session;
  const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
  if (!handoverAndHolidays?.itemsForChangeover) return undefined;
  return handoverAndHolidays.itemsForChangeover.noDecisionRequired
    ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: handoverAndHolidays.itemsForChangeover.answer,
      });
};

export const whatWillHappen = (request: Request): string | PerChildFormattedAnswerForPdf | undefined => {
  const { initialAdultName, namesOfChildren } = request.session;
  const specialDays = getSessionValue<any>(request.session, 'specialDays');
  if (!specialDays?.whatWillHappen) return undefined;

  const data = specialDays.whatWillHappen;

  // Helper to format a single answer
  const formatAnswer = (answer: any): string | undefined => {
    if (!answer) return undefined;
    if (answer.noDecisionRequired) {
      return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
    }
    if (answer.answer) {
      return request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: answer.answer,
      });
    }
    return undefined;
  };

  // Handle legacy format (direct answer without default wrapper)
  if (data.noDecisionRequired !== undefined && data.default === undefined) {
    return data.noDecisionRequired
      ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
      : request.__('sharePlan.yourProposedPlan.senderSuggested', {
          senderName: initialAdultName,
          suggestion: data.answer,
        });
  }

  // Handle the "do not need to decide" case
  if (data.default?.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const defaultAnswer = formatAnswer(data.default) || '';

  // If there are no per-child overrides, return just the default answer
  if (!data.byChild || Object.keys(data.byChild).length === 0) {
    return defaultAnswer;
  }

  // Return structured data with per-child answers
  const perChildAnswers = Object.entries(data.byChild)
    .filter(([_, answer]: [string, any]) => answer.answer && !answer.noDecisionRequired)
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

export const whatOtherThingsMatter = (request: Request) => {
  const { initialAdultName } = request.session;
  const otherThings = getSessionValue<any>(request.session, 'otherThings');
  if (!otherThings?.whatOtherThingsMatter) return undefined;
  return otherThings.whatOtherThingsMatter.noDecisionRequired
    ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: otherThings.whatOtherThingsMatter.answer,
      });
};

export const planLastMinuteChanges = (request: Request) => {
  const { initialAdultName } = request.session;
  const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
  if (!decisionMaking?.planLastMinuteChanges) return undefined;
  if (decisionMaking.planLastMinuteChanges.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }
  if (decisionMaking.planLastMinuteChanges.options.includes('anotherArrangement')) {
    return request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion: decisionMaking.planLastMinuteChanges.anotherArrangementDescription,
    });
  }
  return request.__('sharePlan.yourProposedPlan.decisionMaking.planLastMinuteChanges.howChangesCommunicated', {
    senderName: initialAdultName,
    methods: formatPlanChangesOptionsIntoList(request),
  });
};

export const planLongTermNotice = (request: Request) => {
  const { initialAdultName } = request.session;
  const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
  if (!decisionMaking?.planLongTermNotice) return undefined;
  if (decisionMaking.planLongTermNotice.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }
  if (decisionMaking.planLongTermNotice.otherAnswer) {
    return request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion: decisionMaking.planLongTermNotice.otherAnswer,
    });
  }
  return request.__('sharePlan.yourProposedPlan.decisionMaking.planLongTermNotice.howChangesCommunicated', {
    senderName: initialAdultName,
    numberOfWeeks: decisionMaking.planLongTermNotice.weeks.toString(),
  });
};

export const planReview = (request: Request) => {
  const { initialAdultName } = request.session;
  const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
  if (!decisionMaking?.planReview) return undefined;
  let number: number;
  let translationName: string;

  if (decisionMaking.planReview.months) {
    number = decisionMaking.planReview.months;
    translationName = 'sharePlan.yourProposedPlan.decisionMaking.planReview.suggestedMonths';
  } else {
    number = decisionMaking.planReview.years;
    translationName = 'sharePlan.yourProposedPlan.decisionMaking.planReview.suggestedYears';
  }

  const translationSuffix = number === 1 ? 'Singular' : 'Plural';

  return request.__(translationName + translationSuffix, {
    senderName: initialAdultName,
    number: number.toString(),
  });
};
