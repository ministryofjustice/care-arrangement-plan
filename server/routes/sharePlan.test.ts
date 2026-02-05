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
        describeArrangement: 'livingAndVisitingArrangement',
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
        noDecisionRequired: false,
        answer: 'whatWillHappenAnswer',
      },
    },
  },
  otherThings: {
    whatOtherThingsMatter: {
      noDecisionRequired: false,
      answer: 'whatOtherThingsMatterAnswer',
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

describe(`GET ${paths.SHARE_PLAN}`, () => {
  beforeEach(() => {
    Object.assign(sessionMock, structuredClone(session));
  });

  it('should render share plan page', () => {
    return request(app)
      .get(paths.SHARE_PLAN)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('You&#39;ve created a proposed child arrangements plan.');
      });
  });

  it('should include instructions to download the plan', () => {
    return request(app)
      .get(paths.SHARE_PLAN)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toMatch('Download a PDF or accessible HTML version of this plan and share with Sam.');
      });
  });
});
