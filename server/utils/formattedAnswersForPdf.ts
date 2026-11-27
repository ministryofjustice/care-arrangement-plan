import { Request } from 'express';

import { whereHandoverField } from '../@types/fields';

import {
  formatItemsForChangeover,
  formatListOfStrings,
  formatPlanChangesOptionsIntoList,
  formatWhichDaysSessionValue,
} from './formValueUtils';
import { childrenReference, parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers';

export const mostlyLive = (request: Request) => {
  const { livingAndVisiting, initialAdultName, secondaryAdultName } = request.session;
  if (!livingAndVisiting.mostlyLive) return undefined;
  switch (livingAndVisiting.mostlyLive.where) {
    case 'withInitial':
    case 'withSecondary':
      return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedLiveWith', {
        senderName: initialAdultName,
        adult: parentMostlyLivedWith(request.session),
      });
    case 'split':
      return request.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedSplit', {
        senderName: initialAdultName,
        otherAdult: secondaryAdultName,
      });
    case 'other':
      return request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: request.session.initialAdultName,
        suggestion: livingAndVisiting.mostlyLive.describeArrangement,
      });
    default:
      return undefined;
  }
};

export const whichSchedule = (request: Request) => {
  const { livingAndVisiting, initialAdultName } = request.session;
  if (!livingAndVisiting.whichSchedule) return undefined;
  return livingAndVisiting.whichSchedule.noDecisionRequired
    ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: livingAndVisiting.whichSchedule.answer,
      });
};

export const willOvernightsHappen = (request: Request) => {
  const { livingAndVisiting, initialAdultName } = request.session;
  if (!livingAndVisiting.overnightVisits) return undefined;
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
  const { livingAndVisiting, initialAdultName } = request.session;
  if (!livingAndVisiting.overnightVisits?.whichDays) return undefined;
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
  const { livingAndVisiting, initialAdultName } = request.session;
  if (!livingAndVisiting.daytimeVisits) return undefined;
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
  const { livingAndVisiting, initialAdultName } = request.session;
  if (!livingAndVisiting.daytimeVisits?.whichDays) return undefined;
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

export const getBetweenHouseholds = (request: Request) => {
  const { handoverAndHolidays, initialAdultName, secondaryAdultName } = request.session;
  if (!handoverAndHolidays?.getBetweenHouseholds) return undefined;
  if (handoverAndHolidays.getBetweenHouseholds.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const children = childrenReference(request);
  const suggested = (suggestion: string) =>
    request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion,
    });

  switch (handoverAndHolidays.getBetweenHouseholds.how) {
    case 'parent':
      return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedCollects', {
        senderName: initialAdultName,
        adult: initialAdultName,
      });
    case 'otherParent':
      return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedCollects', {
        senderName: initialAdultName,
        adult: secondaryAdultName,
      });
    case 'bothParents':
      return suggested(request.__('handoverAndHolidays.getBetweenHouseholds.bothParentsCollect', { children }));
    case 'someoneElse': {
      const collects = request.__('handoverAndHolidays.getBetweenHouseholds.someoneElseCollects', { children });
      const whoWillCollect = handoverAndHolidays.getBetweenHouseholds.whoWillCollect;
      return suggested(whoWillCollect ? `${collects}: ${whoWillCollect}` : collects);
    }
    case 'anotherArrangement':
      return suggested(handoverAndHolidays.getBetweenHouseholds.describeArrangement);
    default:
      return undefined;
  }
};

export const whereHandover = (request: Request) => {
  const { handoverAndHolidays, initialAdultName, secondaryAdultName } = request.session;
  if (handoverAndHolidays.whereHandover.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

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
      case 'other':
        return handoverAndHolidays.whereHandover.other;
      default:
        return undefined;
    }
  };

  return request.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedHandover', {
    senderName: initialAdultName,
    location: formatListOfStrings(handoverAndHolidays.whereHandover.where.map(getAnswerForWhereHandoverWhere), request),
  });
};

export const willChangeDuringSchoolHolidays = (request: Request) => {
  const { handoverAndHolidays, initialAdultName } = request.session;
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

export const howChangeDuringSchoolHolidays = (request: Request) => {
  const { handoverAndHolidays, initialAdultName } = request.session;
  if (!handoverAndHolidays.howChangeDuringSchoolHolidays) return undefined;

  return handoverAndHolidays.howChangeDuringSchoolHolidays.noDecisionRequired
    ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: handoverAndHolidays.howChangeDuringSchoolHolidays.answer,
      });
};

export const itemsForChangeover = (request: Request) => {
  const { handoverAndHolidays, initialAdultName } = request.session;
  const items = handoverAndHolidays?.itemsForChangeover;
  if (!items) return undefined;
  if (items.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = formatItemsForChangeover(items.options, items.describeArrangement, request) ?? items.answer;
  if (!suggestion) return undefined;

  return request.__('sharePlan.yourProposedPlan.senderSuggested', {
    senderName: initialAdultName,
    suggestion,
  });
};

const suggestedAnswer = (request: Request, senderName: string, suggestion: string | undefined) => {
  if (!suggestion) return undefined;

  return request.__('sharePlan.yourProposedPlan.senderSuggested', {
    senderName,
    suggestion,
  });
};

export const travelAbroad = (request: Request) => {
  const { handoverAndHolidays, initialAdultName } = request.session;
  const travel = handoverAndHolidays?.travelAbroad;
  if (!travel) return undefined;

  if (travel.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = travel.options
    ?.map((option) => {
      switch (option) {
        case 'twoWeeks':
          return request.__('handoverAndHolidays.travelAbroad.twoWeeks');
        case 'fourWeeks':
          return request.__('handoverAndHolidays.travelAbroad.fourWeeks');
        case 'eightWeeks':
          return request.__('handoverAndHolidays.travelAbroad.eightWeeks');
        case 'anotherArrangement':
          return travel.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option)
    .join(', ');

  return suggestedAnswer(request, initialAdultName, suggestion);
};

export const travelDocuments = (request: Request) => {
  const { handoverAndHolidays, initialAdultName } = request.session;
  const documents = handoverAndHolidays?.travelDocuments;
  if (!documents) return undefined;

  if (documents.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = documents.options
    ?.map((option) => {
      switch (option) {
        case 'parent':
          return request.__('handoverAndHolidays.travelDocuments.parent');
        case 'otherParent':
          return request.__('handoverAndHolidays.travelDocuments.otherParent');
        case 'bothParents':
          return request.__('handoverAndHolidays.travelDocuments.bothParents').trim();
        case 'parentTravelling':
          return request.__('handoverAndHolidays.travelDocuments.parentTravelling');
        case 'anotherArrangement':
          return documents.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option)
    .join(', ');

  return suggestedAnswer(request, initialAdultName, suggestion);
};

export const travelInformation = (request: Request) => {
  const { handoverAndHolidays, initialAdultName } = request.session;
  const information = handoverAndHolidays?.travelInformation;
  if (!information) return undefined;

  if (information.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const labels = information.options
    ?.map((option) => {
      switch (option) {
        case 'dates':
          return request.__('handoverAndHolidays.travelInformation.travelInformation');
        case 'group':
          return request.__('handoverAndHolidays.travelInformation.travelGroup');
        case 'address':
          return request.__('handoverAndHolidays.travelInformation.accommodationAddress');
        case 'contact':
          return request.__('handoverAndHolidays.travelInformation.emergencyContact');
        case 'passport':
          return request.__('handoverAndHolidays.travelInformation.passportHandover');
        case 'other':
          return information.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option);

  if (!labels?.length) return undefined;

  return suggestedAnswer(request, initialAdultName, formatListOfStrings(labels, request));
};

export const whatWillHappen = (request: Request) => {
  const { specialDays, initialAdultName } = request.session;
  return specialDays.whatWillHappen.noDecisionRequired
    ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: specialDays.whatWillHappen.answer,
      });
};

export const whatOtherThingsMatter = (request: Request) => {
  const { otherThings, initialAdultName } = request.session;
  return otherThings.whatOtherThingsMatter.noDecisionRequired
    ? request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : request.__('sharePlan.yourProposedPlan.senderSuggested', {
        senderName: initialAdultName,
        suggestion: otherThings.whatOtherThingsMatter.answer,
      });
};

export const planLastMinuteChanges = (request: Request) => {
  const { decisionMaking, initialAdultName } = request.session;
  if (decisionMaking.planLastMinuteChanges.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }
  if (decisionMaking.planLastMinuteChanges.options.includes('anotherArrangement')) {
    return request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion: decisionMaking.planLastMinuteChanges.anotherArrangementDescription,
    });
  }
  return request.__('sharePlan.decisionMaking.planLastMinuteChanges.howChangesCommunicated', {
    senderName: initialAdultName,
    methods: formatPlanChangesOptionsIntoList(request),
  });
};

export const planLongTermNotice = (request: Request) => {
  const { decisionMaking, initialAdultName } = request.session;
  if (decisionMaking.planLongTermNotice.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }
  if (decisionMaking.planLongTermNotice.otherAnswer) {
    return request.__('sharePlan.yourProposedPlan.senderSuggested', {
      senderName: initialAdultName,
      suggestion: decisionMaking.planLongTermNotice.otherAnswer,
    });
  }
  return request.__('sharePlan.decisionMaking.planLongTermNotice.howChangesCommunicated', {
    senderName: initialAdultName,
    numberOfWeeks: decisionMaking.planLongTermNotice.weeks.toString(),
  });
};

export const planReview = (request: Request) => {
  const { decisionMaking, initialAdultName } = request.session;
  let number: number;
  let translationName: string;

  if (decisionMaking.planReview.months) {
    number = decisionMaking.planReview.months;
    translationName = 'sharePlan.decisionMaking.planReview.suggestedMonths';
  } else {
    number = decisionMaking.planReview.years;
    translationName = 'sharePlan.decisionMaking.planReview.suggestedYears';
  }

  const translationSuffix = number === 1 ? 'Singular' : 'Plural';

  return request.__(translationName + translationSuffix, {
    senderName: initialAdultName,
    number: number.toString(),
  });
};

export const childHealthRoutineDecisions = (request: Request) => {
  const { childHealth, initialAdultName } = request.session;
  const routineDecisions = childHealth?.routineDecisions;
  if (!routineDecisions) return undefined;

  if (routineDecisions.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = routineDecisions.options
    ?.map((option) => {
      switch (option) {
        case 'parent':
          return request.__('childHealth.routineDecisions.options.parent');
        case 'otherParent':
          return request.__('childHealth.routineDecisions.options.otherParent');
        case 'bothParents':
          return request.__('childHealth.routineDecisions.options.bothParents');
        case 'anotherArrangement':
          return routineDecisions.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option)
    .join(', ');

  if (!suggestion) return undefined;

  return request.__('sharePlan.yourProposedPlan.senderSuggested', {
    senderName: initialAdultName,
    suggestion,
  });
};

export const childHealthNeeds = (request: Request) => {
  const { childHealth, initialAdultName } = request.session;
  const needs = childHealth?.childHealthNeeds;
  if (!needs) return undefined;

  if (needs.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  if (!needs.description) return undefined;

  return request.__('sharePlan.yourProposedPlan.senderSuggested', {
    senderName: initialAdultName,
    suggestion: needs.description,
  });
};

const suggestedEducationAnswer = (request: Request, senderName: string, suggestion: string | undefined) => {
  if (!suggestion) return undefined;

  return request.__('sharePlan.yourProposedPlan.senderSuggested', {
    senderName,
    suggestion,
  });
};

export const educationShareInformation = (request: Request) => {
  const { education, initialAdultName } = request.session;
  const shareInformation = education?.shareInformation;
  if (!shareInformation) return undefined;

  if (shareInformation.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = shareInformation.options
    ?.map((option) => {
      switch (option) {
        case 'parent':
          return request.__('education.shareInformation.options.parent');
        case 'otherParent':
          return request.__('education.shareInformation.options.otherParent');
        case 'bothParents':
          return request.__('education.shareInformation.options.bothParents');
        case 'anotherArrangement':
          return shareInformation.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option)
    .join(', ');

  return suggestedEducationAnswer(request, initialAdultName, suggestion);
};

export const educationRoutineDecisions = (request: Request) => {
  const { education, initialAdultName } = request.session;
  const routineDecisions = education?.routineDecisions;
  if (!routineDecisions) return undefined;

  if (routineDecisions.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = routineDecisions.options
    ?.map((option) => {
      switch (option) {
        case 'parent':
          return request.__('education.routineDecisions.options.parent');
        case 'otherParent':
          return request.__('education.routineDecisions.options.otherParent');
        case 'bothParents':
          return request.__('education.routineDecisions.options.bothParents');
        case 'anotherArrangement':
          return routineDecisions.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option)
    .join(', ');

  return suggestedEducationAnswer(request, initialAdultName, suggestion);
};

export const educationSchoolMeetings = (request: Request) => {
  const { education, initialAdultName } = request.session;
  const schoolMeetings = education?.schoolMeetings;
  if (!schoolMeetings) return undefined;

  if (schoolMeetings.noDecisionRequired) {
    return request.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName });
  }

  const suggestion = schoolMeetings.options
    ?.map((option) => {
      switch (option) {
        case 'parent':
          return request.__('education.schoolMeetings.options.parent');
        case 'otherParent':
          return request.__('education.schoolMeetings.options.otherParent');
        case 'bothParents':
          return request.__('education.schoolMeetings.options.bothParents');
        case 'carer':
          return request.__('education.schoolMeetings.options.carer', { childName: childrenReference(request) });
        case 'anotherArrangement':
          return schoolMeetings.describeArrangement;
        default:
          return undefined;
      }
    })
    .filter((option): option is string => !!option)
    .join(', ');

  return suggestedEducationAnswer(request, initialAdultName, suggestion);
};
