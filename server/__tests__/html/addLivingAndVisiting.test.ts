import { Request } from 'express';

import addLivingAndVisiting from '../../html/addLivingAndVisiting';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addLivingAndVisiting', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      session: sessionMock,
      __: jest.fn((key: string, options?: Record<string, unknown>) => {
        if (options) {
          return `${key}:${JSON.stringify(options)}`;
        }
        return key;
      }) as any,
    } as Partial<Request>;
  });

  test('generates HTML for "other" living arrangement', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'Custom living arrangement',
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="living-visiting"',
      'aria-labelledby=',
      'Custom living arrangement',
      '</section>'
    );
  });

  test('generates HTML for split schedule arrangement', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: 'Week on, week off schedule',
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="living-visiting"',
      'Week on, week off schedule'
    );
  });

  test('generates HTML for living with adult with no visits', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: false,
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="living-visiting"');
  });

  test('generates HTML for living with adult with overnight visits', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withSecondary',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: ['monday', 'wednesday', 'friday'],
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="living-visiting"');
  });

  test('generates HTML for living with adult with daytime visits only', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: false,
            days: ['saturday', 'sunday'],
          },
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="living-visiting"');
  });

  test('includes textbox for compromise notes at end of section', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'arrangement',
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    expectHtmlToContain(
      html,
      'sharePlan.yourProposedPlan.endOfSection',
      'sharePlan.yourProposedPlan.compromise.livingAndVisiting'
    );
  });

  test('handles multiple children names correctly', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['Alice', 'Bob', 'Charlie'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      livingAndVisiting: {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: 'Alternating weeks',
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="living-visiting"');
  });
});
