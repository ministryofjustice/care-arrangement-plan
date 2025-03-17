import { dayValues, getBetweenHouseholdsField, whereHandoverField, whereMostlyLive } from './fields';

export type WhichDays = {
  days?: dayValues[];
  describeArrangement?: string;
  noDecisionRequired?: boolean;
};

export type CAPSession = {
  nowInMinutes: number;
  courtOrderInPlace: boolean;
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
};
