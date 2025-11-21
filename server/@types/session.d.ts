import {
  dayValues,
  getBetweenHouseholdsField,
  planLastMinuteChangesField,
  whereHandoverField,
  whereMostlyLive,
} from './fields';

export type WhichDays = {
  days?: dayValues[];
  describeArrangement?: string;
  noDecisionRequired?: boolean;
};

export type CAPSession = {
  completedSteps?: string[];
  numberOfChildren: number;
  namesOfChildren: string[];
  initialAdultName: string;
  secondaryAdultName: string;
  livingAndVisiting?: {
    mostlyLive?: {
      where: whereMostlyLive;
      describeArrangement?: string;
    };
    whichSchedule?: {
      noDecisionRequired: boolean;
      answer?: string;
    };
    overnightVisits?: {
      willHappen: boolean;
      whichDays?: WhichDays;
    };
    daytimeVisits?: {
      willHappen: boolean;
      whichDays?: WhichDays;
    };
  };
  handoverAndHolidays?: {
    getBetweenHouseholds?: {
      noDecisionRequired: boolean;
      how?: getBetweenHouseholdsField;
      describeArrangement?: string;
    };
    whereHandover?: {
      noDecisionRequired: boolean;
      where?: whereHandoverField[];
      someoneElse?: string;
    };
    willChangeDuringSchoolHolidays?: {
      noDecisionRequired: boolean;
      willChange?: boolean;
    };
    howChangeDuringSchoolHolidays?: {
      noDecisionRequired: boolean;
      answer?: string;
    };
    itemsForChangeover?: {
      noDecisionRequired: boolean;
      answer?: string;
    };
  };
  specialDays?: {
    whatWillHappen?: {
      noDecisionRequired: boolean;
      answer?: string;
    };
  };
  otherThings?: {
    whatOtherThingsMatter?: {
      noDecisionRequired: boolean;
      answer?: string;
    };
  };
  decisionMaking?: {
    planLastMinuteChanges?: {
      options?: planLastMinuteChangesField[];
      anotherArrangementDescription?: string;
      noDecisionRequired: boolean;
    };
    planLongTermNotice?: {
      weeks?: number;
      otherAnswer?: string;
      noDecisionRequired: boolean;
    };
    planReview?: {
      months?: number;
      years?: number;
    };
  };
};
