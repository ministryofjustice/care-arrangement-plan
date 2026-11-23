import { Request } from 'express';

import addEducation from '../../html/addEducation';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addEducation', () => {
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

  test('renders school information, routine decisions, and school meetings', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      education: {
        shareInformation: { noDecisionRequired: false, options: ['bothParents'] },
        routineDecisions: { noDecisionRequired: false, options: ['parent'] },
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent attends parents evening',
        },
      },
    });

    const html = addEducation(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="education"',
      'aria-labelledby="education-heading"',
      'sharePlan.education.sectionTitle',
      'sharePlan.education.title',
      'sharePlan.education.schoolInfo.question',
      'education.shareInformation.options.bothParents',
      'sharePlan.education.routineDecisions.question',
      'education.routineDecisions.options.parent',
      'sharePlan.education.schoolMeetings.question',
      'A grandparent attends parents evening',
      'sharePlan.education.schoolMeetings.doNotAgree',
      '</section>',
    );
  });

  test('renders the do not decide wording when each question is skipped', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      education: {
        shareInformation: { noDecisionRequired: true },
        routineDecisions: { noDecisionRequired: true },
        schoolMeetings: { noDecisionRequired: true },
      },
    });

    const html = addEducation(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="education"', 'sharePlan.yourProposedPlan.senderSuggestedDoNotDecide');
  });

  test('includes a carer attending school meetings', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      education: {
        shareInformation: { noDecisionRequired: false, options: ['parent'] },
        routineDecisions: { noDecisionRequired: false, options: ['bothParents'] },
        schoolMeetings: { noDecisionRequired: false, options: ['carer'] },
      },
    });

    const html = addEducation(mockRequest as Request);

    expectHtmlToContain(
      html,
      'education.schoolMeetings.options.carer',
      'education.routineDecisions.options.bothParents',
    );
  });

  test('returns nothing when education has not been answered', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });
    delete sessionMock.education;

    expect(addEducation(mockRequest as Request)).toBe('');
  });
});
