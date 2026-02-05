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
      default: {
        where: 'other',
        describeArrangement: 'describeArrangement',
      },
    },
  },
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
    whatOtherThingsMatter: { default: { noDecisionRequired: true } },
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
      });
  });
});
