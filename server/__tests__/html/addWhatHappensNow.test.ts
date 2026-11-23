import { Request } from 'express';

import addWhatHappensNow from '../../html/addWhatHappensNow';
import en from '../../locales/en.json';
import { validateHtmlStructure } from '../../test-utils/htmlUtils';

const translate = (key: string): string => {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, en);

  if (typeof value !== 'string') {
    throw new Error(`Missing translation for ${key}`);
  }

  return value;
};

const request = { __: translate } as Request;

describe('addWhatHappensNow', () => {
  const html = addWhatHappensNow(request);

  test('renders the section 9 end of form question and writing space', () => {
    validateHtmlStructure(html);

    expect(html).toContain('<section id="what-happens-now" aria-labelledby="what-happens-now-heading">');
    expect(html).toContain('Section 9');
    expect(html).toContain('<h2 id="what-happens-now-heading">End of form</h2>');
    expect(html).toContain(
      '<strong>Is there anything else you would like to suggest for the child arrangements plan?</strong>',
    );
    expect(html).toContain('You can use this space to write any other information you would like included in the plan');
    expect(html).toContain('id="end-of-form-other-information"');
    expect(html).toContain('name="endOfFormOtherInformation"');
  });

  test('renders the joint agreement, declaration, and signature fields', () => {
    expect(html).toContain('<h2>Joint agreement</h2>');
    expect(html).toContain(
      'Now that you have recorded your decisions, you should download or print a copy of this plan so you both have one.',
    );
    expect(html).toContain(
      '<strong> As with all parts of this document, you don&#039;t have to complete this section if you don’t want to.</strong>',
    );
    expect(html).toContain('class="joint-agreement-declaration"');
    expect(html).toContain('As parents of Jason');
    expect(html).toContain('best interests come first.');

    ['Name', 'Signature', 'Date'].forEach((label) => {
      expect(html.match(new RegExp(`<label[^>]*>${label}</label>`, 'g'))).toHaveLength(2);
    });

    expect(html).toContain('id="jointAgreementName-1" name="jointAgreementName1"');
    expect(html).toContain('id="jointAgreementName-2" name="jointAgreementName2"');
    expect(html).toContain('id="jointAgreementSignature-1" name="jointAgreementSignature1"');
    expect(html).toContain('id="jointAgreementSignature-2" name="jointAgreementSignature2"');
    expect(html).toContain('id="jointAgreementDate-1" name="jointAgreementDate1"');
    expect(html).toContain('id="jointAgreementDate-2" name="jointAgreementDate2"');
  });

  test('renders the legal status, next steps, and linked support details', () => {
    expect(html).toContain('<h3>Legal status of this agreement</h3>');
    expect(html).toContain('This is not a legal contract.');
    expect(html).toContain('<a href="https://www.gov.uk/find-legal-advice">www.gov.uk/find-legal-advice</a>.');

    expect(html).toContain('<h2>What to do next</h2>');
    expect(html).toContain('You can send this proposed child arrangements plan back to Harrison.');
    expect(html).toContain('<strong>Any plan you make using this form is not legally binding.</strong>');
    expect(html).toContain(
      'The other person does not have to do what it says and either of you can suggest changes to it at any time.',
    );

    expect(html).toContain('<h3>If you cannot reach an agreement</h3>');
    expect(html).toContain(
      '<a href="https://www.gov.uk/find-ways-to-make-child-arrangements">www.gov.uk/find-ways-to-make-child-arrangements</a>',
    );
    expect(html).toContain(
      '<a href="https://www.gov.uk/looking-after-children-divorce">https://www.gov.uk/looking-after-children-divorce</a>.',
    );

    expect(html).toContain('<h3>Get paid to give your feedback</h3>');
    expect(html).toContain(
      '<a href="https://www.smartsurvey.co.uk/s/EFO5FJ/">https://www.smartsurvey.co.uk/s/EFO5FJ/</a>',
    );
  });
});
