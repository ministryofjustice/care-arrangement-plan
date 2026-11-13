import express, { Express } from 'express';
import { SessionData } from 'express-session';
import request from 'supertest';

import { getBetweenHouseholdsField, planLastMinuteChangesField, whereHandoverField } from '../@types/fields';
import setUpi18n from '../middleware/setUpi18n';
import { sessionMock } from '../test-utils/testMocks';

import {
  childHealthNeeds,
  childHealthRoutineDecisions,
  educationRoutineDecisions,
  educationSchoolMeetings,
  educationShareInformation,
  getBetweenHouseholds,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
  mostlyLive,
  travelAbroad,
  travelDocuments,
  travelInformation,
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
        travelAbroad: travelAbroad(request),
        travelDocuments: travelDocuments(request),
        travelInformation: travelInformation(request),
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
      education: {
        shareInformation: educationShareInformation(request),
        routineDecisions: educationRoutineDecisions(request),
        schoolMeetings: educationSchoolMeetings(request),
      },
      childHealth: {
        routineDecisions: childHealthRoutineDecisions(request),
        healthNeeds: childHealthNeeds(request),
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
      noDecisionRequired: true,
    },
    whereHandover: {
      noDecisionRequired: true,
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
      noDecisionRequired: true,
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
          where: 'other',
          describeArrangement: arrangement,
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
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: arrangement,
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
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: true,
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
          where: 'withInitial',
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
          where: 'withInitial',
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
            whichDaysOvernight: `The children will stay overnight with ${session.initialAdultName} on Monday, Wednesday and Friday`,
            willDaytimeVisitsHappen: 'No',
          });
        });
    });

    it('should return correctly for with adult selected days', () => {
      const arrangement = 'arrangement';
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withSecondary',
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
            whichDaysDaytimeVisits: `The children will have daytime visits with ${session.secondaryAdultName} on a Saturday`,
          });
        });
    });
  });

  describe('handoverAndHolidays', () => {
    it.each([
      [
        {
          getBetweenHouseholds: { noDecisionRequired: true },
          whereHandover: { noDecisionRequired: true },
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
          getBetweenHouseholds: { noDecisionRequired: false, how: 'parent' as getBetweenHouseholdsField },
          whereHandover: {
            noDecisionRequired: false,
            where: ['neutral', 'initialHome', 'school'] as whereHandoverField[],
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: false },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.initialAdultName} collects the children`,
          whereHandover: `<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0"><li>Neutral location</li><li>At ${session.initialAdultName}&#039;s home</li><li>At school (term time only)</li></ul>`,
          willChangeDuringSchoolHolidays: 'No',
          itemsForChangeover: 'itemsForChangeover arrangement',
        },
      ],
      [
        {
          getBetweenHouseholds: {
            noDecisionRequired: false,
            how: 'anotherArrangement' as getBetweenHouseholdsField,
            describeArrangement: 'getBetweenHouseholds arrangement',
          },
          whereHandover: {
            noDecisionRequired: false,
            where: ['other'] as whereHandoverField[],
            other: 'Grandma',
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
          howChangeDuringSchoolHolidays: { noDecisionRequired: false, answer: 'howChangeDuringSchoolHolidays answer' },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: 'getBetweenHouseholds arrangement',
          whereHandover:
            '<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0"><li>Grandma</li></ul>',
          willChangeDuringSchoolHolidays: 'Yes',
          howChangeDuringSchoolHolidays: 'howChangeDuringSchoolHolidays answer',
          itemsForChangeover: 'itemsForChangeover arrangement',
        },
      ],
      [
        {
          getBetweenHouseholds: { noDecisionRequired: false, how: 'parent' as getBetweenHouseholdsField },
          whereHandover: {
            noDecisionRequired: false,
            where: ['neutral', 'other'] as whereHandoverField[],
            other: 'the park near school',
          },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: false },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.initialAdultName} collects the children`,
          whereHandover:
            '<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0"><li>Neutral location</li><li>the park near school</li></ul>',
          willChangeDuringSchoolHolidays: 'No',
          itemsForChangeover: 'itemsForChangeover arrangement',
        },
      ],
      [
        {
          getBetweenHouseholds: { noDecisionRequired: false, how: 'otherParent' as getBetweenHouseholdsField },
          whereHandover: { noDecisionRequired: false, where: ['secondaryHome'] as whereHandoverField[] },
          willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
          howChangeDuringSchoolHolidays: { noDecisionRequired: true },
          itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
        },
        {
          getBetweenHouseholds: `${session.secondaryAdultName} collects the children`,
          whereHandover: `<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0"><li>At ${session.secondaryAdultName}&#039;s home</li></ul>`,
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

    it('should list selected changeover items and the other items description', async () => {
      sessionMock.handoverAndHolidays = {
        ...session.handoverAndHolidays,
        itemsForChangeover: {
          noDecisionRequired: false,
          options: ['clothesAndShoes', 'schoolItems', 'otherItems'],
          describeArrangement: 'Medication',
        },
      };

      await request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays.itemsForChangeover).toBe(
            '<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0"><li>Clothes and shoes</li><li>School items</li><li>Medication</li></ul>',
          );
        });
    });

    it('should format travel abroad, travel documents and travel information', async () => {
      sessionMock.handoverAndHolidays = {
        ...session.handoverAndHolidays,
        travelAbroad: { noDecisionRequired: false, options: ['fourWeeks'] },
        travelDocuments: { noDecisionRequired: false, options: ['parentTravelling'] },
        travelInformation: {
          noDecisionRequired: false,
          options: ['dates', 'contact', 'other'],
          describeArrangement: 'Flight numbers',
        },
      };

      await request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays.travelAbroad).toBe('At least 4 weeks');
          expect(response.body.handoverAndHolidays.travelDocuments).toBe('The parent travelling with the children');
          expect(response.body.handoverAndHolidays.travelInformation).toBe(
            '<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0"><li>Travel information (dates, transport details)</li><li>Emergency contact details</li><li>Flight numbers</li></ul>',
          );
        });
    });

    it('should format skipped travel answers as no decision', async () => {
      sessionMock.handoverAndHolidays = {
        ...session.handoverAndHolidays,
        travelAbroad: { noDecisionRequired: true },
        travelDocuments: { noDecisionRequired: true },
        travelInformation: { noDecisionRequired: true },
      };

      await request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays.travelAbroad).toBe('We do not need to decide this');
          expect(response.body.handoverAndHolidays.travelDocuments).toBe('We do not need to decide this');
          expect(response.body.handoverAndHolidays.travelInformation).toBe('We do not need to decide this');
        });
    });

    it('should use the free-text arrangement for another travel arrangement', async () => {
      sessionMock.handoverAndHolidays = {
        ...session.handoverAndHolidays,
        travelAbroad: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'At least 12 weeks',
        },
        travelDocuments: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent arranges the passports',
        },
      };

      await request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays.travelAbroad).toBe('At least 12 weeks');
          expect(response.body.handoverAndHolidays.travelDocuments).toBe('A grandparent arranges the passports');
        });
    });

    it('should return both parents and someone else answers', async () => {
      sessionMock.handoverAndHolidays = {
        ...session.handoverAndHolidays,
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'bothParents',
        },
      };

      await request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays.getBetweenHouseholds).toBe(
            'Both parents take turns collecting the children',
          );
        });

      sessionMock.handoverAndHolidays = {
        ...session.handoverAndHolidays,
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'someoneElse',
          whoWillCollect: 'Grandmother',
        },
      };

      await request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.handoverAndHolidays.getBetweenHouseholds).toBe('Grandmother');
        });
    });
  });

  describe('specialDays', () => {
    it('should return correctly for no need to decide what will happen', () => {
      sessionMock.specialDays = {
        whatWillHappen: {
          noDecisionRequired: true,
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
          noDecisionRequired: false,
          answer,
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

  describe('education and child health', () => {
    const notRequired = 'We do not need to decide this';

    it('should omit education and health answers that have not been given', () => {
      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.education).toEqual({});
          expect(response.body.childHealth).toEqual({});
        });
    });

    it('should return the skipped answer when no decision is required', () => {
      sessionMock.education = {
        shareInformation: { noDecisionRequired: true },
        routineDecisions: { noDecisionRequired: true },
        schoolMeetings: { noDecisionRequired: true },
      };
      sessionMock.childHealth = {
        routineDecisions: { noDecisionRequired: true },
        childHealthNeeds: { noDecisionRequired: true },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.education).toEqual({
            shareInformation: notRequired,
            routineDecisions: notRequired,
            schoolMeetings: notRequired,
          });
          expect(response.body.childHealth).toEqual({
            routineDecisions: notRequired,
            healthNeeds: notRequired,
          });
        });
    });

    it('should format the selected education and health answers', () => {
      sessionMock.education = {
        shareInformation: { noDecisionRequired: false, options: ['bothParents'] },
        routineDecisions: { noDecisionRequired: false, options: ['parent', 'otherParent'] },
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent attends parents evening',
        },
      };
      sessionMock.childHealth = {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent books routine appointments',
        },
        childHealthNeeds: {
          noDecisionRequired: false,
          description: 'Inhaler every morning',
        },
      };

      return request(app)
        .get(testPath)
        .expect((response) => {
          expect(response.body.education).toEqual({
            shareInformation: 'Both Parents will receive updates',
            routineDecisions: 'Parent will make decisions, Other Parent will make decisions',
            schoolMeetings: 'A grandparent attends parents evening',
          });
          expect(response.body.childHealth).toEqual({
            routineDecisions: 'A grandparent books routine appointments',
            healthNeeds: 'Inhaler every morning',
          });
        });
    });
  });
});
