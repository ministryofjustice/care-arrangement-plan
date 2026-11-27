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
      how: 'parent',
    },
    whereHandover: {
      noDecisionRequired: false,
      where: ['neutral', 'initialHome', 'secondaryHome', 'school', 'other'],
      other: 'A grandparent’s house',
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
      options: ['clothesAndShoes', 'schoolItems', 'toiletries', 'sports', 'toys', 'electronicDevices', 'otherItems'],
      describeArrangement: 'Any medication',
    },
    travelAbroad: {
      noDecisionRequired: false,
      options: ['fourWeeks'],
    },
    travelDocuments: {
      noDecisionRequired: false,
      options: ['bothParents'],
    },
    travelInformation: {
      noDecisionRequired: false,
      options: ['dates', 'group', 'address', 'contact', 'passport', 'other'],
      describeArrangement: 'Flight numbers',
    },
  },
  education: {
    shareInformation: { noDecisionRequired: false, options: ['bothParents'] },
    routineDecisions: { noDecisionRequired: false, options: ['parent'] },
    schoolMeetings: { noDecisionRequired: false, options: ['bothParents'] },
  },
  childHealth: {
    routineDecisions: { noDecisionRequired: false, options: ['bothParents'] },
    childHealthNeeds: {
      noDecisionRequired: false,
      description: 'Regular check-ups and an inhaler when needed',
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
