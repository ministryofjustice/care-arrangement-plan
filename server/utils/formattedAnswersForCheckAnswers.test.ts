import express, { Express } from 'express';
import { SessionData } from 'express-session';
import request from 'supertest';

import { getBetweenHouseholdsField, planLastMinuteChangesField, whereHandoverField } from '../@types/fields';
import setUpi18n from '../middleware/setUpi18n';
import { sessionMock } from '../test-utils/testMocks';

import {
  getBetweenHouseholds,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
  mostlyLive,
  whatWillHappen,
  whereHandover,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willChangeDuringSchoolHolidays,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
  whatOtherThingsMatter,
  planLastMinuteChanges,
  planLongTermNotice,
  planReview,
} from './formattedAnswersForCheckAnswers';

const testPath = '/test';

const testAppSetup = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(setUpi18n());
  app.get(testPath, (request, response) => {
    request.session = sessionMock;
    response.json({
      livingAndVisiting: {
        mostlyLive: mostlyLive(request),
        whichSchedule: whichSchedule(request),
        willOvernightsHappen: willOvernightsHappen(request),
        whichDaysOvernight: whichDaysOvernight(request),
        willDaytimeVisitsHappen: willDaytimeVisitsHappen(request),
        whichDaysDaytimeVisits: whichDaysDaytimeVisits(request),
      },
      handoverAndHolidays: {
        getBetweenHouseholds: getBetweenHouseholds(request),
        whereHandover: whereHandover(request),
        willChangeDuringSchoolHolidays: willChangeDuringSchoolHolidays(request),
        howChangeDuringSchoolHolidays: howChangeDuringSchoolHolidays(request),
        itemsForChangeover: itemsForChangeover(request),
      },
      specialDays: {
        whatWillHappen: whatWillHappen(request),
      },
      otherThings: {
        whatOtherThingsMatter: whatOtherThingsMatter(request),
      },
      decisionMaking: {
        planLastMinuteChanges: planLastMinuteChanges(request),
        planLongTermNotice: planLongTermNotice(request),
        planReview: planReview(request),
      },
    });
  });

  return app;
};

const app = testAppSetup();

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  numberOfChildren: 3,
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
  livingAndVisiting: {},
  handoverAndHolidays: {
    getBetweenHouseholds: {
      default: {
        noDecisionRequired: true,
      },
    },
    whereHandover: {
      default: {
        noDecisionRequired: true,
      },
    },
    willChangeDuringSchoolHolidays: {
      noDecisionRequired: true,
    },
    itemsForChangeover: {
      noDecisionRequired: true,
    },
  },
  specialDays: {
    whatWillHappen: {
      default: {
        noDecisionRequired: true,
      },
    },
  },
  otherThings: {
    whatOtherThingsMatter: {
      noDecisionRequired: true,
    },
  },
  decisionMaking: {
    planLastMinuteChanges: {
      noDecisionRequired: true,
    },
    planLongTermNotice: {
      noDecisionRequired: true,
    },
    planReview: {
      months: 2,
    },
  },
};

describe('formattedAnswers', () => {
  beforeEach(() => {
    Object.assign(sessionMock, structuredClone(session));
  });

  describe('livingAndVisiting', () => {
    it('should all return undefined if section is not answered', () => {
      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({});
        });
    });

    it('should return correctly for other', () => {
      const arrangement = 'arrangement';
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'other',
            describeArrangement: arrangement,
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({ mostlyLive: arrangement });
        });
    });

    it('should return correctly for split with answer', () => {
      const arrangement = 'arrangement';
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'split',
          },
        },
        whichSchedule: {
          default: {
            noDecisionRequired: false,
            answer: arrangement,
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `They will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
            whichSchedule: arrangement,
          });
        });
    });

    it('should return correctly for split with no decision required', () => {
      sessionMock.namesOfChildren = ['James'];
      sessionMock.numberOfChildren = 1;
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'split',
          },
        },
        whichSchedule: {
          default: {
            noDecisionRequired: true,
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `They will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
            whichSchedule: 'We do not need to decide this',
          });
        });
    });

    it('should return correctly for with adult with no overnights', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'withInitial',
          },
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `With ${session.initialAdultName}`,
            willOvernightsHappen: 'No',
            willDaytimeVisitsHappen: 'Yes',
            whichDaysDaytimeVisits: 'We do not need to decide this',
          });
        });
    });

    it('should return correctly for with adult with no daytime visits', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'withInitial',
          },
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: ['monday', 'wednesday', 'friday'],
          },
        },
        daytimeVisits: {
          willHappen: false,
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `With ${session.initialAdultName}`,
            willOvernightsHappen: 'Yes',
            whichDaysOvernight: `The children will stay overnight with ${session.secondaryAdultName} on Monday, Wednesday and Friday`,
            willDaytimeVisitsHappen: 'No',
          });
        });
    });

    it('should return correctly for with adult selected days', () => {
      const arrangement = 'arrangement';
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'withSecondary',
          },
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            describeArrangement: arrangement,
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            days: ['saturday'],
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `With ${session.secondaryAdultName}`,
            willOvernightsHappen: 'Yes',
            whichDaysOvernight: arrangement,
            willDaytimeVisitsHappen: 'Yes',
            whichDaysDaytimeVisits: `The children will have daytime visits with ${session.initialAdultName} on a Saturday`,
          });
        });
    });
  });

  describe('handoverAndHolidays', () => {
    it.each([
      [
        {
          getBetweenHouseholds: {
            default: { noDecisionRequired: true },
          },
          whereHandover: {
            default: { noDecisionRequired: true },
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: true },
          itemsForChangeover: { noDecisionRequired: true },
        },
        {
          getBetweenHouseholds: 'We do not need to decide this',
          whereHandover: 'We do not need to decide this',
          willChangeDuringSchoolHolidays: 'We do not need to decide this',
          itemsForChangeover: 'We do not need to decide this',
        },
      ],
      [
        {
          getBetweenHouseholds: {
            default: { noDecisionRequired: false, how: 'initialCollects' as getBetweenHouseholdsField },
          },
          whereHandover: {
            default: {
              noDecisionRequired: false,
              where: ['neutral', 'initialHome', 'school'] as whereHandoverField[],
            },
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: false },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.initialAdultName} collects the children`,
          whereHandover: `Neutral location, At ${session.initialAdultName}'s home, At school`,
          willChangeDuringSchoolHolidays: 'No',
          itemsForChangeover: 'itemsForChangeover arrangement',
        },
      ],
      [
        {
          getBetweenHouseholds: {
            default: {
              noDecisionRequired: false,
              how: 'other' as getBetweenHouseholdsField,
              describeArrangement: 'getBetweenHouseholds arrangement',
            },
          },
          whereHandover: {
            default: {
              noDecisionRequired: false,
              where: ['someoneElse'] as whereHandoverField[],
              someoneElse: 'Grandma',
            },
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
          howChangeDuringSchoolHolidays: { default: { noDecisionRequired: false, answer: 'howChangeDuringSchoolHolidays answer' } },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: 'getBetweenHouseholds arrangement',
          whereHandover: 'Grandma',
          willChangeDuringSchoolHolidays: 'Yes',
          howChangeDuringSchoolHolidays: 'howChangeDuringSchoolHolidays answer',
          itemsForChangeover: 'itemsForChangeover arrangement',
        },
      ],
      [
        {
          getBetweenHouseholds: {
            default: { noDecisionRequired: false, how: 'secondaryCollects' as getBetweenHouseholdsField },
          },
          whereHandover: {
            default: { noDecisionRequired: false, where: ['secondaryHome'] as whereHandoverField[] },
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
          howChangeDuringSchoolHolidays: { default: { noDecisionRequired: true } },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.secondaryAdultName} collects the children`,
          whereHandover: `At ${session.secondaryAdultName}'s home`,
          willChangeDuringSchoolHolidays: 'Yes',
          howChangeDuringSchoolHolidays: 'We do not need to decide this',
          itemsForChangeover: 'itemsForChangeover arrangement',
        },
      ],
    ])('should return the correct value for handover and holidays', (handoverAndHolidays, expectedValues) => {
      sessionMock.handoverAndHolidays = handoverAndHolidays;

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays).toEqual(expectedValues);
        });
    });
  });

  describe('specialDays', () => {
    it('should return correctly for no need to decide what will happen', () => {
      sessionMock.specialDays = {
        whatWillHappen: {
          default: {
            noDecisionRequired: true,
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.specialDays).toEqual({ whatWillHappen: 'We do not need to decide this' });
        });
    });
    it('should return correctly for answer to what will happen', () => {
      const answer = 'answer';
      sessionMock.specialDays = {
        whatWillHappen: {
          default: {
            noDecisionRequired: false,
            answer,
          },
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.specialDays).toEqual({ whatWillHappen: answer });
        });
    });
  });

  describe('otherThings', () => {
    it('should return correctly for no need to decide what will happen', () => {
      sessionMock.otherThings = {
        whatOtherThingsMatter: {
          noDecisionRequired: true,
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.otherThings).toEqual({ whatOtherThingsMatter: 'We do not need to decide this' });
        });
    });
    it('should return correctly for answer to what will happen', () => {
      const answer = 'answer';
      sessionMock.otherThings = {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer,
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.otherThings).toEqual({ whatOtherThingsMatter: answer });
        });
    });
  });

  describe('decisionMaking', () => {
    it.each([
      [
        {
          planLastMinuteChanges: { noDecisionRequired: true },
          planLongTermNotice: { noDecisionRequired: true },
          planReview: { months: 1 },
        },
        {
          planLastMinuteChanges: 'We do not need to decide this',
          planLongTermNotice: 'We do not need to decide this',
          planReview: '1 month',
        },
      ],
      [
        {
          planLastMinuteChanges: {
            options: ['anotherArrangement'] as planLastMinuteChangesField[],
            anotherArrangementDescription: 'planLastMinuteChanges answer',
            noDecisionRequired: false,
          },
          planLongTermNotice: { noDecisionRequired: false, otherAnswer: 'planLongTermNotice answer' },
          planReview: { months: 2 },
        },
        {
          planLastMinuteChanges: 'planLastMinuteChanges answer',
          planLongTermNotice: 'planLongTermNotice answer',
          planReview: '2 months',
        },
      ],
      [
        {
          planLastMinuteChanges: {
            options: ['phone'] as planLastMinuteChangesField[],
            noDecisionRequired: false,
          },
          planLongTermNotice: { noDecisionRequired: false, weeks: 2 },
          planReview: { years: 1 },
        },
        {
          planLastMinuteChanges: 'With a phone call',
          planLongTermNotice: '2 weeks',
          planReview: '1 year',
        },
      ],
      [
        {
          planLastMinuteChanges: {
            options: ['phone', 'app', 'text', 'email'] as planLastMinuteChangesField[],
            noDecisionRequired: false,
          },
          planLongTermNotice: { noDecisionRequired: false, weeks: 4 },
          planReview: { years: 2 },
        },
        {
          planLastMinuteChanges: 'With a phone call, using a parenting app, by text message and by email',
          planLongTermNotice: '4 weeks',
          planReview: '2 years',
        },
      ],
    ])('should return the correct value for decision making', (decisionMaking, expectedValues) => {
      sessionMock.decisionMaking = decisionMaking;

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.decisionMaking).toEqual(expectedValues);
        });
    });
  });
});
