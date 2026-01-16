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

// Per-child answer structure for questions that can have different answers for each child
export type PerChildAnswer<T> = {
  // Default answer that applies to all children unless overridden
  default: T;
  // Optional per-child overrides, keyed by child index (0, 1, 2, etc.)
  byChild?: Record<number, T>;
};

// Answer type for howChangeDuringSchoolHolidays
export type HowChangeDuringSchoolHolidaysAnswer = {
  noDecisionRequired: boolean;
  answer?: string;
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
    // Updated to support per-child answers
    howChangeDuringSchoolHolidays?: PerChildAnswer<HowChangeDuringSchoolHolidaysAnswer>;
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
