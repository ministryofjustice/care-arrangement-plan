import { Request } from 'express';

import addHealth from '../../html/addHealth';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addHealth', () => {
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

  test('renders routine health decisions and health needs', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      childHealth: {
        routineDecisions: { noDecisionRequired: false, options: ['otherParent'] },
        childHealthNeeds: { noDecisionRequired: false, description: 'Inhaler every morning' },
      },
    });

    const html = addHealth(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="child-health"',
      'aria-labelledby="child-health-heading"',
      'sharePlan.childHealth.sectionTitle',
      'sharePlan.childHealth.title',
      'sharePlan.childHealth.routineDecisions.question',
      'childHealth.routineDecisions.options.otherParent',
      'sharePlan.childHealth.healthNeeds.question',
      'Inhaler every morning',
      'sharePlan.childHealth.healthNeeds.doNotAgree',
      '</section>',
    );
  });

  test('renders the do not decide wording when both questions are skipped', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      childHealth: {
        routineDecisions: { noDecisionRequired: true },
        childHealthNeeds: { noDecisionRequired: true },
      },
    });

    const html = addHealth(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="child-health"', 'sharePlan.yourProposedPlan.senderSuggestedDoNotDecide');
  });

  test('includes another arrangement for routine health decisions', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      childHealth: {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent books routine appointments',
        },
        childHealthNeeds: { noDecisionRequired: false, description: 'Asthma review every six months' },
      },
    });

    const html = addHealth(mockRequest as Request);

    expectHtmlToContain(html, 'A grandparent books routine appointments', 'Asthma review every six months');
  });

  test('returns nothing when health has not been answered', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });
    delete sessionMock.childHealth;

    expect(addHealth(mockRequest as Request)).toBe('');
  });
});
