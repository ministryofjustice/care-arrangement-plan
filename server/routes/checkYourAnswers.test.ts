import { SessionData } from 'express-session';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
  livingAndVisiting: {
    mostlyLive: {
      where: 'other',
      describeArrangement: 'describeArrangement',
    },
  },
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
      months: 1,
    },
  },
};

describe(`GET ${paths.CHECK_YOUR_ANSWERS}`, () => {
  it('should render check your answers page', () => {
    Object.assign(sessionMock, structuredClone(session));

    return request(app)
      .get(paths.CHECK_YOUR_ANSWERS)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Check your answers');
        expect(response.text).toContain('Bob and Sam');
        expect(response.text).toContain('James, Rachel and Jack');
        expect(response.text).toContain('Special days');
      });
  });

  it('should render education and health answers with links back to those questions', () => {
    Object.assign(sessionMock, structuredClone(session), {
      education: {
        shareInformation: { noDecisionRequired: false, options: ['bothParents'] },
        routineDecisions: { noDecisionRequired: false, options: ['parent'] },
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent attends parents evening',
        },
      },
      childHealth: {
        routineDecisions: { noDecisionRequired: false, options: ['otherParent'] },
        childHealthNeeds: { noDecisionRequired: false, description: 'Inhaler every morning' },
      },
    });

    return request(app)
      .get(paths.CHECK_YOUR_ANSWERS)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Education');
        expect(response.text).toContain('Health');
        expect(response.text).toContain('Both Parents will receive updates');
        expect(response.text).toContain('Parent will make decisions');
        expect(response.text).toContain('A grandparent attends parents evening');
        expect(response.text).toContain('Other Parent will decide');
        expect(response.text).toContain('Inhaler every morning');
        expect(response.text).toContain(`href="${paths.EDUCATION_SHARE_INFORMATION}"`);
        expect(response.text).toContain(`href="${paths.EDUCATION_ROUTINE_DECISIONS}"`);
        expect(response.text).toContain(`href="${paths.EDUCATION_SCHOOL_MEETINGS}"`);
        expect(response.text).toContain(`href="${paths.CHILD_HEALTH}"`);
        expect(response.text).toContain(`href="${paths.CHILD_HEALTH_NEEDS}"`);
      });
  });
});
