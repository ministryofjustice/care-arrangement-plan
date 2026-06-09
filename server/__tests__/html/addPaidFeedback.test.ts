import { Request } from 'express';
import i18n from 'i18n';

import addPaidFeedback from '../../html/addPaidFeedback';
import { expectHtmlToContain, validateHtmlStructure } from '../../test-utils/htmlUtils';

describe('addPaidFeedback', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      __: i18n.__.bind(i18n),
    } as Partial<Request>;
  });

  test('generates accessible HTML for the paid feedback section', () => {
    const html = addPaidFeedback(mockRequest as Request);

    validateHtmlStructure(html);
    expectHtmlToContain(
      html,
      '<section id="paid-feedback"',
      'aria-labelledby="paid-feedback-heading"',
      '<h2 id="paid-feedback-heading">',
      '</section>',
    );
  });

  test('includes localized paid feedback content and sign-up link', () => {
    const html = addPaidFeedback(mockRequest as Request);
    const signUpLink = i18n.__('pdf.paidFeedback.signUpLink');

    expectHtmlToContain(
      html,
      i18n.__('pdf.paidFeedback.title'),
      i18n.__('pdf.paidFeedback.helpToImprove'),
      i18n.__('pdf.paidFeedback.signUp'),
      `<a href="${signUpLink}">${signUpLink}</a>`,
    );
  });
});
