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
      }) as jest.Mock,
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
    expect(html).not.toContain('livingAndVisiting.whichSchedule.title');
    expect(html).not.toContain('livingAndVisiting.willOvernightsHappen.title');
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
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: ['friday'],
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            days: ['saturday'],
          },
        },
      },
    });

    const html = addLivingAndVisiting(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="living-visiting"',
      'livingAndVisiting.whichSchedule.title',
      'livingAndVisiting.whichSchedule.exactSplitWarning',
      'Week on, week off schedule',
    );
    expect(html).not.toContain('livingAndVisiting.willOvernightsHappen.title');
    expect(html).not.toContain('livingAndVisiting.whichDaysOvernight.title');
    expect(html).not.toContain('livingAndVisiting.willDaytimeVisitsHappen.title');
    expect(html).not.toContain('livingAndVisiting.whichDaysDaytimeVisits.title');
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
    expectHtmlToContain(
      html,
      '<section id="living-visiting"',
      'livingAndVisiting.willOvernightsHappen.title',
      'livingAndVisiting.willDaytimeVisitsHappen.title',
    );
    expect(html).not.toContain('livingAndVisiting.whichSchedule.title');
    expect(html).not.toContain('livingAndVisiting.whichDaysOvernight.title');
    expect(html).not.toContain('livingAndVisiting.whichDaysDaytimeVisits.title');
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

  test('renders the section title without an end-of-section compromise box', () => {
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
      '<h1 class="section-heading-title">sharePlan.yourProposedPlan.livingAndVisiting.sectionTitle</h1>',
      '<h2 class="section-heading">taskList.livingAndVisiting</h2>',
    );
    expect(html).not.toContain('sharePlan.yourProposedPlan.endOfSection');
    expect(html).not.toContain('sharePlan.yourProposedPlan.compromise.livingAndVisiting');
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
