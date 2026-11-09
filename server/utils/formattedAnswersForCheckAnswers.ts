import { Request } from 'express';

import {
  childHealthRoutineDecisionsField,
  educationRoutineDecisionsField,
  educationSchoolMeetingsField,
  educationShareInformationField,
  travelAbroadField,
  travelDocumentsField,
  travelInformationField,
  whereHandoverField,
} from '../@types/fields';

import {
  formatItemsForChangeoverList,
  formatPlanChangesOptionsIntoList,
  formatUnorderedList,
  formatWhichDaysSessionValue,
} from './formValueUtils';
import { formattedChildrenNames, parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers';

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
  const children = formattedChildrenNames(request);

  switch (handoverAndHolidays.getBetweenHouseholds.how) {
    case 'parent':
      return request.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', {
        adult: initialAdultName,
        children,
      });
    case 'otherParent':
      return request.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', {
        adult: secondaryAdultName,
        children,
      });
    case 'bothParents':
      return request.__('handoverAndHolidays.getBetweenHouseholds.bothParentsCollect', { children });
    case 'someoneElse':
      return handoverAndHolidays.getBetweenHouseholds.whoWillCollect;
    case 'anotherArrangement':
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
      case 'other':
        return handoverAndHolidays.whereHandover.other;
      default:
        return undefined;
    }
  };

  return formatUnorderedList(handoverAndHolidays.whereHandover.where.map(getAnswerForWhereHandoverWhere));
};

export const educationShareInformation = (request: Request) => {
  const shareInformation = request.session.education?.shareInformation;
  if (!shareInformation) return undefined;
  if (shareInformation.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  if (!shareInformation.options?.length) return undefined;

  const getAnswerForEducationShareInformation = (who: educationShareInformationField) => {
    switch (who) {
      case 'parent':
        return request.__('checkYourAnswers.education.shareInformation.answer', { answer: 'Parent' });
      case 'otherParent':
        return request.__('checkYourAnswers.education.shareInformation.answer', { answer: 'Other Parent' });
      case 'bothParents':
        return request.__('checkYourAnswers.education.shareInformation.answer', { answer: 'Both Parents' });
      case 'anotherArrangement':
        return shareInformation.describeArrangement;
      default:
        return undefined;
    }
  };

  return shareInformation.options.map(getAnswerForEducationShareInformation).join(', ');
};

export const educationRoutineDecisions = (request: Request) => {
  const routineDecisions = request.session.education?.routineDecisions;
  if (!routineDecisions) return undefined;
  if (routineDecisions.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  if (!routineDecisions.options?.length) return undefined;

  const getAnswerForEducationRoutineDecisions = (who: educationRoutineDecisionsField) => {
    switch (who) {
      case 'parent':
        return request.__('checkYourAnswers.education.routineDecisions.answer', { answer: 'Parent' });
      case 'otherParent':
        return request.__('checkYourAnswers.education.routineDecisions.answer', { answer: 'Other Parent' });
      case 'bothParents':
        return request.__('checkYourAnswers.education.routineDecisions.answer', { answer: 'Both Parents' });
      case 'anotherArrangement':
        return routineDecisions.describeArrangement;
      default:
        return undefined;
    }
  };

  return routineDecisions.options.map(getAnswerForEducationRoutineDecisions).join(', ');
};

export const educationSchoolMeetings = (request: Request) => {
  const schoolMeetings = request.session.education?.schoolMeetings;
  if (!schoolMeetings) return undefined;
  if (schoolMeetings.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  if (!schoolMeetings.options?.length) return undefined;

  const getAnswerForEducationSchoolMeetings = (who: educationSchoolMeetingsField) => {
    switch (who) {
      case 'parent':
        return request.__('checkYourAnswers.education.schoolMeetings.answer', { answer: 'Parent' });
      case 'otherParent':
        return request.__('checkYourAnswers.education.schoolMeetings.answer', { answer: 'Other Parent' });
      case 'bothParents':
        return request.__('checkYourAnswers.education.schoolMeetings.answer', { answer: 'Both Parents' });
      case 'carer':
        return request.__('checkYourAnswers.education.schoolMeetings.answer', { answer: 'Carer' });
      case 'anotherArrangement':
        return schoolMeetings.describeArrangement;
      default:
        return undefined;
    }
  };

  return schoolMeetings.options.map(getAnswerForEducationSchoolMeetings).join(', ');
};

export const childHealthRoutineDecisions = (request: Request) => {
  const routineDecisions = request.session.childHealth?.routineDecisions;
  if (!routineDecisions) return undefined;
  if (routineDecisions.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }
  if (!routineDecisions.options?.length) return undefined;

  const getAnswerForChildHealthRoutineDecisions = (who: childHealthRoutineDecisionsField) => {
    switch (who) {
      case 'parent':
        return request.__('checkYourAnswers.childHealth.routineDecisions.answer', { answer: 'Parent' });
      case 'otherParent':
        return request.__('checkYourAnswers.childHealth.routineDecisions.answer', { answer: 'Other Parent' });
      case 'bothParents':
        return request.__('checkYourAnswers.childHealth.routineDecisions.answer', { answer: 'Both Parents' });
      case 'anotherArrangement':
        return routineDecisions.describeArrangement;
      default:
        return undefined;
    }
  };

  return routineDecisions.options.map(getAnswerForChildHealthRoutineDecisions).join(', ');
};

export const childHealthNeeds = (request: Request) => {
  const needs = request.session.childHealth?.childHealthNeeds;
  if (!needs) return undefined;

  return needs.noDecisionRequired ? request.__('doNotNeedToDecide') : needs.description;
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
  const items = request.session.handoverAndHolidays?.itemsForChangeover;
  if (!items) return undefined;
  if (items.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  return formatItemsForChangeoverList(items.options, items.describeArrangement, request) ?? items.answer;
};

export const travelAbroad = (request: Request) => {
  const { handoverAndHolidays } = request.session;
  if (!handoverAndHolidays?.travelAbroad) return undefined;
  if (handoverAndHolidays.travelAbroad.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const getAnswerForTravelAbroad = (option: travelAbroadField) => {
    switch (option) {
      case 'twoWeeks':
        return request.__('checkYourAnswers.handoverAndHolidays.travelAbroad.answer', { answer: 'At least 2 weeks' });
      case 'fourWeeks':
        return request.__('checkYourAnswers.handoverAndHolidays.travelAbroad.answer', { answer: 'At least 4 weeks' });
      case 'eightWeeks':
        return request.__('checkYourAnswers.handoverAndHolidays.travelAbroad.answer', { answer: 'At least 8 weeks' });
      case 'anotherArrangement':
        return handoverAndHolidays.travelAbroad.describeArrangement;
      default:
        return undefined;
    }
  };

  return handoverAndHolidays.travelAbroad.options?.map(getAnswerForTravelAbroad).join(', ');
};

export const travelDocuments = (request: Request) => {
  const { handoverAndHolidays } = request.session;
  if (!handoverAndHolidays?.travelDocuments) return undefined;
  if (handoverAndHolidays.travelDocuments.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const getAnswerForTravelDocuments = (option: travelDocumentsField) => {
    switch (option) {
      case 'parent':
        return request.__('checkYourAnswers.handoverAndHolidays.travelDocuments.answer', { answer: 'Parent' });
      case 'otherParent':
        return request.__('checkYourAnswers.handoverAndHolidays.travelDocuments.answer', { answer: 'Other parent' });
      case 'bothParents':
        return request.__('checkYourAnswers.handoverAndHolidays.travelDocuments.answer', { answer: 'Both parents' });
      case 'parentTravelling':
        return request.__('checkYourAnswers.handoverAndHolidays.travelDocuments.answer', {
          answer: 'The parent travelling with the children',
        });
      case 'anotherArrangement':
        return handoverAndHolidays.travelDocuments.describeArrangement;
      default:
        return undefined;
    }
  };

  return handoverAndHolidays.travelDocuments.options?.map(getAnswerForTravelDocuments).join(', ');
};

export const travelInformation = (request: Request) => {
  const { handoverAndHolidays } = request.session;
  if (!handoverAndHolidays?.travelInformation) return undefined;
  if (handoverAndHolidays.travelInformation.noDecisionRequired) {
    return request.__('doNotNeedToDecide');
  }

  const getAnswerForTravelInformation = (option: travelInformationField) => {
    switch (option) {
      case 'dates':
        return request.__('checkYourAnswers.handoverAndHolidays.travelInformation.answer', {
          answer: request.__('handoverAndHolidays.travelInformation.travelInformation'),
        });
      case 'group':
        return request.__('checkYourAnswers.handoverAndHolidays.travelInformation.answer', {
          answer: request.__('handoverAndHolidays.travelInformation.travelGroup'),
        });
      case 'address':
        return request.__('checkYourAnswers.handoverAndHolidays.travelInformation.answer', {
          answer: request.__('handoverAndHolidays.travelInformation.accommodationAddress'),
        });
      case 'contact':
        return request.__('checkYourAnswers.handoverAndHolidays.travelInformation.answer', {
          answer: request.__('handoverAndHolidays.travelInformation.emergencyContact'),
        });
      case 'passport':
        return request.__('checkYourAnswers.handoverAndHolidays.travelInformation.answer', {
          answer: request.__('handoverAndHolidays.travelInformation.passportHandover'),
        });
      case 'other':
        return handoverAndHolidays.travelInformation.describeArrangement;
      default:
        return undefined;
    }
  };

  return formatUnorderedList(handoverAndHolidays.travelInformation.options?.map(getAnswerForTravelInformation) ?? []);
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
