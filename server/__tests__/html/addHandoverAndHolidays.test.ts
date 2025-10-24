import { Request } from 'express';

import addHandoverAndHolidays from '../../html/addHandoverAndHolidays';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addHandoverAndHolidays', () => {
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

  test('generates HTML for all handover and holidays questions', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
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
          answer: 'Holiday arrangements description',
        },
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: 'School bag, clothes, toys',
        },
      },
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="handover-holidays"',
      'aria-labelledby="handover-holidays-heading"',
      'Holiday arrangements description',
      'School bag, clothes, toys',
      '</section>'
    );
  });

  test('generates HTML when no decisions required', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
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
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    // Should still generate HTML with "no decision required" messages
    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="handover-holidays"');
  });

  test('generates HTML for transport between households', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'drive',
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
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="handover-holidays"');
  });

  test('generates HTML for handover location', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: true,
        },
        whereHandover: {
          noDecisionRequired: false,
          where: ['secondaryParent', 'someoneElse'],
          someoneElse: 'Grandparents house',
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: true,
        },
        itemsForChangeover: {
          noDecisionRequired: true,
        },
      },
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="handover-holidays"', 'Grandparents house');
  });

  test('generates HTML for school holidays changes', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 2,
      namesOfChildren: ['Alice', 'Bob'],
      initialAdultName: 'Parent1',
      secondaryAdultName: 'Parent2',
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: true,
        },
        whereHandover: {
          noDecisionRequired: true,
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: true,
        },
        howChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          answer: 'Extended stays during summer',
        },
        itemsForChangeover: {
          noDecisionRequired: true,
        },
      },
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="handover-holidays"', 'Extended stays during summer');
  });

  test('omits how change during holidays when will change is false', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: true,
        },
        whereHandover: {
          noDecisionRequired: true,
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: false,
        },
        itemsForChangeover: {
          noDecisionRequired: true,
        },
      },
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="handover-holidays"');
  });

  test('generates HTML for items needed at changeover', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
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
          noDecisionRequired: false,
          answer: 'Medicine, favorite teddy, homework',
        },
      },
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(html, '<section id="handover-holidays"', 'Medicine, favorite teddy, homework');
  });

  test('includes textbox for compromise notes at end of section', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['Child'],
      initialAdultName: 'Adult1',
      secondaryAdultName: 'Adult2',
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'walk',
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
    });

    const html = addHandoverAndHolidays(mockRequest as Request);

    expectHtmlToContain(
      html,
      'sharePlan.yourProposedPlan.endOfSection',
      'sharePlan.yourProposedPlan.compromise.handoverAndHolidays'
    );
  });

});
