import express, { Express } from 'express';
import { SessionData } from 'express-session';
import request from 'supertest';

import { getBetweenHouseholdsField, planLastMinuteChangesField, whereHandoverField } from '../@types/fields';
import setUpi18n from '../middleware/setUpi18n';
import { sessionMock } from '../test-utils/testMocks';

import {
  mostlyLive,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
  whatWillHappen,
  itemsForChangeover,
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  whatOtherThingsMatter,
  planReview,
  planLongTermNotice,
  planLastMinuteChanges,
} from './formattedAnswersForPdf';

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
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `${session.initialAdultName} suggested:\n"${arrangement}"`,
          });
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
            mostlyLive: `${session.initialAdultName} said the children will split their time between ${session.secondaryAdultName}'s home and ${session.initialAdultName}'s home.`,
            whichSchedule: `${session.initialAdultName} suggested:\n"${arrangement}"`,
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
            mostlyLive: `${session.initialAdultName} said the children will split their time between ${session.secondaryAdultName}'s home and ${session.initialAdultName}'s home.`,
            whichSchedule: `${session.initialAdultName} suggested that this does not need to be decided.`,
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
            mostlyLive: `${session.initialAdultName} suggested that the children mostly live with ${session.initialAdultName}.`,
            willOvernightsHappen: `${session.initialAdultName} suggested that overnights do not happen at this time.`,
            willDaytimeVisitsHappen: `${session.initialAdultName} suggested that the children do daytime visits to ${session.secondaryAdultName}'s home.`,
            whichDaysDaytimeVisits: `${session.initialAdultName} suggested that this does not need to be decided.`,
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
            mostlyLive: `${session.initialAdultName} suggested that the children mostly live with ${session.initialAdultName}.`,
            willOvernightsHappen: `${session.initialAdultName} suggested that the children stay overnight at ${session.secondaryAdultName}'s home.`,
            whichDaysOvernight: `${session.initialAdultName} suggested that overnight visits happen on Monday, Wednesday and Friday.`,
            willDaytimeVisitsHappen: `${session.initialAdultName} suggested that daytime visits do not happen at this time.`,
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
            mostlyLive: `${session.initialAdultName} suggested that the children mostly live with ${session.secondaryAdultName}.`,
            willOvernightsHappen: `${session.initialAdultName} suggested that the children stay overnight at ${session.initialAdultName}'s home.`,
            whichDaysOvernight: `${session.initialAdultName} suggested:\n"arrangement"`,
            willDaytimeVisitsHappen: `${session.initialAdultName} suggested that the children do daytime visits to ${session.initialAdultName}'s home.`,
            whichDaysDaytimeVisits: `${session.initialAdultName} suggested that daytime visits happen on a Saturday.`,
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
          getBetweenHouseholds: `${session.initialAdultName} suggested that this does not need to be decided.`,
          whereHandover: `${session.initialAdultName} suggested that this does not need to be decided.`,
          willChangeDuringSchoolHolidays: `${session.initialAdultName} suggested that this does not need to be decided.`,
          itemsForChangeover: `${session.initialAdultName} suggested that this does not need to be decided.`,
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
          getBetweenHouseholds: `${session.initialAdultName} suggested that ${session.initialAdultName} collects the children.`,
          whereHandover: `${session.initialAdultName} suggested that handover takes place at a neutral location, ${session.initialAdultName}'s home and school`,
          willChangeDuringSchoolHolidays: `${session.initialAdultName} suggested that these arrangements do not change during school holidays.`,
          itemsForChangeover: `${session.initialAdultName} suggested:\n"itemsForChangeover arrangement"`,
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
              where: ['other'] as whereHandoverField[],
              other: 'Grandma',
            },
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
          howChangeDuringSchoolHolidays: { default: { noDecisionRequired: false, answer: 'howChangeDuringSchoolHolidays answer' } },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.initialAdultName} suggested:\n"getBetweenHouseholds arrangement"`,
          whereHandover: `${session.initialAdultName} suggested that handover takes place at Grandma`,
          willChangeDuringSchoolHolidays: `${session.initialAdultName} suggested that these arrangements should change during school holidays.`,
          howChangeDuringSchoolHolidays: `${session.initialAdultName} suggested:\n"howChangeDuringSchoolHolidays answer"`,
          itemsForChangeover: `${session.initialAdultName} suggested:\n"itemsForChangeover arrangement"`,
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
              where: ['neutral', 'other'] as whereHandoverField[],
              other: 'the park near school',
            },
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: false },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.initialAdultName} suggested that ${session.initialAdultName} collects the children.`,
          whereHandover: `${session.initialAdultName} suggested that handover takes place at a neutral location and the park near school`,
          willChangeDuringSchoolHolidays: `${session.initialAdultName} suggested that these arrangements do not change during school holidays.`,
          itemsForChangeover: `${session.initialAdultName} suggested:\n"itemsForChangeover arrangement"`,
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
          getBetweenHouseholds: `${session.initialAdultName} suggested that ${session.secondaryAdultName} collects the children.`,
          whereHandover: `${session.initialAdultName} suggested that handover takes place at ${session.secondaryAdultName}'s home`,
          willChangeDuringSchoolHolidays: `${session.initialAdultName} suggested that these arrangements should change during school holidays.`,
          howChangeDuringSchoolHolidays: `${session.initialAdultName} suggested that this does not need to be decided.`,
          itemsForChangeover: `${session.initialAdultName} suggested:\n"itemsForChangeover arrangement"`,
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
          expect(response.body.specialDays).toEqual({
            whatWillHappen: `${session.initialAdultName} suggested that this does not need to be decided.`,
          });
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
          expect(response.body.specialDays).toEqual({
            whatWillHappen: `${session.initialAdultName} suggested:\n"${answer}"`,
          });
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
          expect(response.body.otherThings).toEqual({
            whatOtherThingsMatter: `${session.initialAdultName} suggested that this does not need to be decided.`,
          });
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
          expect(response.body.otherThings).toEqual({
            whatOtherThingsMatter: `${session.initialAdultName} suggested:\n"${answer}"`,
          });
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
          planLastMinuteChanges: `${session.initialAdultName} suggested that this does not need to be decided.`,
          planLongTermNotice: `${session.initialAdultName} suggested that this does not need to be decided.`,
          planReview: `${session.initialAdultName} suggested that you should review this arrangement in 1 month's time.`,
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
          planLastMinuteChanges: `${session.initialAdultName} suggested:\n"planLastMinuteChanges answer"`,
          planLongTermNotice: `${session.initialAdultName} suggested:\n"planLongTermNotice answer"`,
          planReview: `${session.initialAdultName} suggested that you should review this arrangement in 2 months' time.`,
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
          planLastMinuteChanges: `${session.initialAdultName} suggested that last-minute changes should be communicated with a phone call.`,
          planLongTermNotice: `${session.initialAdultName} suggested that you should both give each other 2 weeks' notice to change long-term arrangements.`,
          planReview: `${session.initialAdultName} suggested that you should review this arrangement in 1 year's time.`,
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
          planLastMinuteChanges: `${session.initialAdultName} suggested that last-minute changes should be communicated with a phone call, using a parenting app, by text message and by email.`,
          planLongTermNotice: `${session.initialAdultName} suggested that you should both give each other 4 weeks' notice to change long-term arrangements.`,
          planReview: `${session.initialAdultName} suggested that you should review this arrangement in 2 years' time.`,
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
