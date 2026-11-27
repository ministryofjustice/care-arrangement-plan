import { Request } from 'express';

import addOtherThings from '../../html/addOtherThings';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addOtherThings', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      session: sessionMock,
      __: jest.fn((key: string, options?: Record<string, unknown>) => {
        if (options) {
          return `${key}:${JSON.stringify(options)}`;
        }
        return key;
      }) as jest.Mock,
    } as Partial<Request>;
  });

  test('renders the section 7 heading and the things to agree', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      otherThings: {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: 'Regular communication about the children',
        },
      },
    });

    const html = addOtherThings(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="other-things"',
      '<h1 class="section-heading-title">sharePlan.otherThings.sectionTitle</h1>',
      '<h2 class="section-heading">sharePlan.otherThings.title</h2>',
      'sharePlan.otherThings.whatOtherThingsMatter.title',
      'sharePlan.otherThings.whatOtherThingsMatter.religionDietAndRules',
      'sharePlan.otherThings.whatOtherThingsMatter.extraCurriculars',
      'sharePlan.otherThings.whatOtherThingsMatter.friendsAndFamily',
      'sharePlan.otherThings.whatOtherThingsMatter.otherContact',
      'Regular communication about the children',
    );
  });
});
