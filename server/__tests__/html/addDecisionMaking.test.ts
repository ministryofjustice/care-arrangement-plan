import { Request } from 'express';

import addDecisionMaking from '../../html/addDecisionMaking';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addDecisionMaking', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      session: sessionMock,
      __: jest.fn((key: string, options?: Record<string, unknown>) => {
        if (options) {
          return `${key}:${JSON.stringify(options)}`;
        }
        return key;
      }),
    } as Partial<Request>;
  });

  test('generates HTML for all decision making questions', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['callOrText', 'discussAndAgree'],
        },
        planLongTermNotice: {
          noDecisionRequired: false,
          options: ['discussAndAgree'],
          weeks: 2,
        },
        planReview: {
          months: 6,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="decision-making"',
      'aria-labelledby="decision-making-heading"',
      '</section>'
    );
  });

  test('generates HTML for plan last minute changes', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['callOrText'],
        },
        planLongTermNotice: {
          noDecisionRequired: true,
        },
        planReview: {
          months: 3,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="decision-making"');
  });

  test('generates HTML with another arrangement description', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          anotherArrangementDescription: 'Custom communication plan',
        },
        planLongTermNotice: {
          noDecisionRequired: true,
        },
        planReview: {
          months: 12,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="decision-making"', 'Custom communication plan');
  });

  test('generates HTML for plan long term notice', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: true,
        },
        planLongTermNotice: {
          noDecisionRequired: false,
          options: ['discussAndAgree', 'other'],
          otherAnswer: 'Custom long term planning',
        },
        planReview: {
          months: 6,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="decision-making"', 'Custom long term planning');
  });

  test('generates HTML for plan review', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: true,
        },
        planLongTermNotice: {
          noDecisionRequired: true,
        },
        planReview: {
          months: 12,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="decision-making"');
  });

  test('generates HTML when all decisions required', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['Child1', 'Child2', 'Child3'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['callOrText', 'discussAndAgree', 'anotherArrangement'],
          anotherArrangementDescription: 'Use shared calendar',
        },
        planLongTermNotice: {
          noDecisionRequired: false,
          options: ['discussAndAgree', 'other'],
          otherAnswer: 'Monthly planning meetings',
        },
        planReview: {
          months: 3,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="decision-making"',
      'Use shared calendar',
      'Monthly planning meetings'
    );
  });

  test('generates HTML when no decisions required', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: true,
        },
        planLongTermNotice: {
          noDecisionRequired: true,
        },
        planReview: {
          months: 6,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    // Plan review should still be there since it always has a value
    // So we check that the section is generated
    expect(html).toBeTruthy();
    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="decision-making"');
  });

  test('includes textbox for compromise notes at end of section', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['callOrText'],
        },
        planLongTermNotice: {
          noDecisionRequired: true,
        },
        planReview: {
          months: 6,
        },
      },
    });

    const html = addDecisionMaking(mockRequest as Request);

    expectHtmlToContain(
      html,
      'sharePlan.yourProposedPlan.endOfSection',
      'sharePlan.yourProposedPlan.compromise.decisionMaking'
    );
  });

  test('handles various review periods correctly', () => {
    const reviewPeriods = [1, 3, 6, 12];

    reviewPeriods.forEach(months => {
      Object.assign(sessionMock, {
        numberOfChildren: 1,
        namesOfChildren: ['Child'],
        initialAdultName: 'Adult1',
        secondaryAdultName: 'Adult2',
        decisionMaking: {
          planLastMinuteChanges: {
            noDecisionRequired: true,
          },
          planLongTermNotice: {
            noDecisionRequired: true,
          },
          planReview: {
            months,
          },
        },
      });

      const html = addDecisionMaking(mockRequest as Request);
      validateHtmlStructure(html);
      expectHtmlToContain(html, '<section id="decision-making"');
    });
  });
});
