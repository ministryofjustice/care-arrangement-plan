import { Request } from 'express';

import addSpecialDays from '../../html/addSpecialDays';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';
import { sessionMock } from '../../test-utils/testMocks';

describe('addSpecialDays', () => {
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

  test('renders the section 6 heading and special day answer', () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      specialDays: {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: 'We will share birthdays and holidays equally',
        },
      },
    });

    const html = addSpecialDays(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="special-days"',
      '<h1 class="section-heading-title">sharePlan.specialDays.sectionTitle</h1>',
      '<h2 class="section-heading">sharePlan.specialDays.title</h2>',
      'sharePlan.specialDays.whatWillHappen.title',
      'sharePlan.specialDays.whatWillHappen.content',
      'We will share birthdays and holidays equally',
    );
  });
});
