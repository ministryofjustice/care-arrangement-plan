import { CAPSession } from '../@types/session';

const devSeedData: Partial<CAPSession> = {
  numberOfChildren: 2,
  namesOfChildren: ['Alex', 'Jamie'],
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Tom',
  livingAndVisiting: {
    mostlyLive: {
      where: 'withInitial',
    },
    overnightVisits: {
      willHappen: true,
      whichDays: {
        days: ['friday', 'saturday'],
      },
    },
    daytimeVisits: {
      willHappen: true,
      whichDays: {
        days: ['wednesday'],
      },
    },
  },
  handoverAndHolidays: {
    getBetweenHouseholds: {
      noDecisionRequired: false,
      how: 'initialCollects',
    },
    whereHandover: {
      noDecisionRequired: false,
      where: ['school'],
    },
    willChangeDuringSchoolHolidays: {
      noDecisionRequired: false,
      willChange: true,
    },
    howChangeDuringSchoolHolidays: {
      noDecisionRequired: false,
      answer: 'During school holidays the children will spend alternate weeks with each parent.',
    },
    itemsForChangeover: {
      noDecisionRequired: false,
      answer: 'Each child should have their school bag, PE kit, and any medication.',
    },
  },
  specialDays: {
    whatWillHappen: {
      noDecisionRequired: false,
      answer: 'Christmas Eve and Christmas Day will alternate each year between parents.',
    },
  },
  otherThings: {
    whatOtherThingsMatter: {
      noDecisionRequired: false,
      answer: 'Both parents should be kept informed about school events and medical appointments.',
    },
  },
  decisionMaking: {
    planLastMinuteChanges: {
      noDecisionRequired: false,
      options: ['phone'],
    },
    planLongTermNotice: {
      noDecisionRequired: false,
      weeks: 4,
    },
    planReview: {
      months: 6,
    },
  },
};

export default devSeedData;
