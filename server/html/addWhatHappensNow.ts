import { Request } from 'express';

import config from '../config';

const escapeHtmlText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const addWhatHappensNow = (request: Request): string => {
  let html = '<section id="what-happens-now" aria-labelledby="what-happens-now-heading">\n';
  html += `  <h2 id="what-happens-now-heading">${escapeHtmlText(request.__('sharePlan.yourProposedPlan.whatHappensNowHeading'))}</h2>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.nowSendPlan', { senderName: request.session.initialAdultName }))}</p>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.notLegallyBinding'))}</p>\n`;
  html += `  <h3 id="what-happens-now-heading">${escapeHtmlText(request.__('sharePlan.yourProposedPlan.cantAgreeHeading'))}</h3>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.unableToAgree'))}</p>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.aMediatorIs'))}</p>\n`;
  html += `  <p><a href="https://www.gov.uk/looking-after-children-divorce">${escapeHtmlText(request.__('sharePlan.yourProposedPlan.moreInfoAndSupport'))}</a></p>\n`;
  html += `  <h3 id="what-happens-now-heading">${escapeHtmlText(request.__('sharePlan.yourProposedPlan.helpUsImproveHeading'))}</h3>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.helpUsImprove'))}</p>\n`;
  html += `  <p><b><a href="${config.feedbackUrl}">${escapeHtmlText(request.__('confirmation.whatDidYouThink'))}</a></b></p>\n`;
  // Note: The last paragraph has URLs, so we don't escape it - it's handled by the customUrlize filter in the template
  html += '</section>\n';

  return html;
};

export default addWhatHappensNow;
