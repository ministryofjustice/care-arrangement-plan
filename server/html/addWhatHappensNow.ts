import { Request } from 'express';

const escapeHtmlText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const linkify = (escapedText: string): string => {
  return escapedText.replace(/(?:https?:\/\/|www\.)[^\s<]+/g, (match) => {
    const trailingPunctuation = match.match(/[.,)]+$/)?.[0] ?? '';
    const url = match.slice(0, match.length - trailingPunctuation.length);
    const href = url.startsWith('www.') ? `https://${url}` : url;

    return `<a href="${href}">${url}</a>${trailingPunctuation}`;
  });
};

const text = (value: string): string => linkify(escapeHtmlText(value));

const paragraphWithBoldSentence = (value: string, boldSentence: 'first' | 'second'): string => {
  const sentenceEnd = value.indexOf('. ');
  if (sentenceEnd === -1) {
    const content = text(value);
    return boldSentence === 'first' ? `<strong>${content}</strong>` : content;
  }

  const firstSentence = text(value.slice(0, sentenceEnd + 1));
  const remainingSentences = text(value.slice(sentenceEnd + 1));

  return boldSentence === 'first'
    ? `<strong>${firstSentence}</strong>${remainingSentences}`
    : `${firstSentence}<strong>${remainingSentences}</strong>`;
};

const signatureField = (label: string, id: string, name: string, multiline: boolean): string => {
  const control = multiline
    ? `<textarea class="govuk-textarea" id="${id}" name="${name}" rows="3"></textarea>`
    : `<input class="govuk-input" id="${id}" name="${name}" type="text" autocomplete="off">`;

  return `    <div class="signature-field">\n      <label class="govuk-label" for="${id}">${escapeHtmlText(label)}</label>\n      ${control}\n    </div>\n`;
};

const signatureFields = (request: Request): string => {
  const label = (key: string) => request.__(`sharePlan.endOfForm.jointAgreement.${key}`);
  const rows = [
    { label: label('Name'), fieldName: 'jointAgreementName', multiline: false },
    { label: label('Signature'), fieldName: 'jointAgreementSignature', multiline: true },
    { label: label('Date'), fieldName: 'jointAgreementDate', multiline: false },
  ];

  const fields = rows
    .flatMap((row) =>
      [1, 2].map((column) =>
        signatureField(row.label, `${row.fieldName}-${column}`, `${row.fieldName}${column}`, row.multiline),
      ),
    )
    .join('');

  return `  <div class="signature-fields">\n${fields}  </div>\n`;
};

const addWhatHappensNow = (request: Request): string => {
  const endOfForm = 'sharePlan.endOfForm';
  const jointAgreement = `${endOfForm}.jointAgreement`;
  const whatToDoNext = `${endOfForm}.whatToDoNext`;
  const signBelow = request.__(`${jointAgreement}.signBelowToConfirm`);
  const legallyBinding = request.__(`${whatToDoNext}.legallyBinding`);

  let html = '<section id="what-happens-now" aria-labelledby="what-happens-now-heading">\n';
  html += `  <h2 class="section-number">${text(request.__(`${endOfForm}.sectionTitle`))}</h2>\n`;
  html += `  <h2 id="what-happens-now-heading">${text(request.__(`${endOfForm}.title`))}</h2>\n`;
  html += `  <p><strong>${text(request.__(`${endOfForm}.subtitle`))}</strong></p>\n`;
  html += `  <div class="text-box">\n`;
  html += `    <div class="govuk-form-group">\n`;
  html += `      <label class="govuk-label" for="end-of-form-other-information">\n`;
  html += `        ${text(request.__(`${endOfForm}.otherInformationLabel`))}\n`;
  html += `      </label>\n`;
  html += `      <textarea class="govuk-textarea user-input-area" id="end-of-form-other-information" name="endOfFormOtherInformation" rows="8"></textarea>\n`;
  html += `    </div>\n`;
  html += `  </div>\n`;

  html += `  <h2>${text(request.__(`${jointAgreement}.title`))}</h2>\n`;
  html += `  <p>${text(request.__(`${jointAgreement}.intro`))}</p>\n`;
  html += `  <p>${paragraphWithBoldSentence(signBelow, 'second')}</p>\n`;
  html += `  <p class="joint-agreement-declaration">${text(request.__(`${jointAgreement}.declarationText`))}</p>\n`;
  html += signatureFields(request);

  html += `  <h3>${text(request.__(`${jointAgreement}.legalStatus.title`))}</h3>\n`;
  html += `  <p>${text(request.__(`${jointAgreement}.legalStatus.intro`))}</p>\n`;
  html += `  <p>${text(request.__(`${jointAgreement}.legalStatus.legallyBinding`))}</p>\n`;

  html += `  <h2>${text(request.__(`${whatToDoNext}.title`))}</h2>\n`;
  html += `  <p>${text(request.__(`${whatToDoNext}.intro`))}</p>\n`;
  html += `  <p>${paragraphWithBoldSentence(legallyBinding, 'first')}</p>\n`;

  html += `  <h3>${text(request.__(`${whatToDoNext}.cannotReachAnAgreement.title`))}</h3>\n`;
  html += `  <p>${text(request.__(`${whatToDoNext}.cannotReachAnAgreement.intro`))}</p>\n`;
  html += `  <p>${text(request.__(`${whatToDoNext}.cannotReachAnAgreement.moreInfo`))}</p>\n`;

  html += `  <h3>${text(request.__(`${whatToDoNext}.feedback.title`))}</h3>\n`;
  html += `  <p>${text(request.__(`${whatToDoNext}.feedback.intro`))}</p>\n`;
  html += '</section>\n';

  return html;
};

export default addWhatHappensNow;
