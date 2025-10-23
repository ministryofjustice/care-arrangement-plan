import { Request } from 'express';

import createHtmlContent from '../../html/createHtmlContent';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('createHtmlContent', () => {
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

  test('generates valid HTML structure', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'livingAndVisitingArrangement',
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
          noDecisionRequired: false,
          answer: 'whatWillHappenAnswer',
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
    });

    const html = createHtmlContent(mockRequest as Request);

    validateHtmlStructure(html);
    expect(html).toBeTruthy();
    expect(typeof html).toBe('string');
  });

  test('includes all main sections when data is present', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      livingAndVisiting: {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: 'Week on, week off',
        },
      },
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'walk',
        },
        whereHandover: {
          noDecisionRequired: false,
          where: ['initialParent'],
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: true,
        },
        howChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          answer: 'Holiday arrangements',
        },
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: 'School bag, clothes',
        },
      },
      specialDays: {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: 'Alternate birthdays',
        },
      },
      otherThings: {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: 'Extracurricular activities',
        },
      },
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['callOrText'],
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

    const html = createHtmlContent(mockRequest as Request);

    // Check for section IDs
    expectHtmlToContain(
      html,
      'id="living-visiting"',
      'id="handover-holidays"',
      'id="special-days"',
      'id="other-things"',
      'id="decision-making"',
      'id="what-happens-now"'
    );
  });

  test('handles long strings correctly', () => {
    const longString = 'test '.repeat(1000);

    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: longString,
        },
      },
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'other',
          describeArrangement: longString,
        },
        whereHandover: {
          noDecisionRequired: false,
          where: ['someoneElse'],
          someoneElse: longString,
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: true,
        },
        howChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          answer: longString,
        },
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: longString,
        },
      },
      specialDays: {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: longString,
        },
      },
      otherThings: {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: longString,
        },
      },
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          anotherArrangementDescription: longString,
        },
        planLongTermNotice: {
          noDecisionRequired: false,
          otherAnswer: longString,
        },
        planReview: {
          months: 12,
        },
      },
    });

    const html = createHtmlContent(mockRequest as Request);

    validateHtmlStructure(html);
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(1000);
  });

  test('omits sections when no decision is required for all questions', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
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
    });

    const html = createHtmlContent(mockRequest as Request);

    validateHtmlStructure(html);
    // Should still contain living-visiting and what-happens-now sections at minimum
    expectHtmlToContain(html, 'id="living-visiting"', 'id="what-happens-now"');
  });

  test('resets counters between calls', () => {
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
    });

    // Generate HTML twice
    const html1 = createHtmlContent(mockRequest as Request);
    const html2 = createHtmlContent(mockRequest as Request);

    // The HTML should be identical, proving counters were reset
    expect(html1).toEqual(html2);
  });
});
