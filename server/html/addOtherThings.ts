import { Request } from 'express';

import { whatOtherThingsMatter } from '../utils/formattedAnswersForPdf';

import { escapeHtmlText, getNextQuestionNumber, renderTextBox } from './addAnswer';

const addOtherThings = (request: Request): string => {
  const answer = whatOtherThingsMatter(request);

  if (!answer) {
    return '';
  }

  const questionNumber = getNextQuestionNumber();
  const radioName = `question-${questionNumber}`;
  const textareaId = `notes-${questionNumber}`;

  let html = '<section id="other-things" aria-labelledby="other-things-heading">\n';
  html += '<div class="answer-section">\n';
  html += `  <h2>${escapeHtmlText(request.__('taskList.otherThings'))}</h2>\n`;
  html += `  <h3>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.title'))}</h3>\n`;
  html += `  <p>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.thingsToAgree'))}</p>\n`;
  html += `  <ul>\n`;
  html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.religionDietAndRules'))}</li>\n`;
  html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.extraCurriculars'))}</li>\n`;
  html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.friendsAndFamily'))}</li>\n`;
  html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.otherContact'))}</li>\n`;
  html += `  </ul>\n`;
  html += `  <p class="answer">${escapeHtmlText(answer)}</p>\n`;
  html += `  <div class="do-you-agree">\n`;
  html += `    <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.doYouAgree'))}</p>\n`;
  html += `    <div class="do-you-agree-options">\n`;
  html += `      <label>\n`;
  html += `        <input type="radio" name="${radioName}" value="yes">\n`;
  html += `        <span>${escapeHtmlText(request.__('yes'))}</span>\n`;
  html += `      </label>\n`;
  html += `      <label>\n`;
  html += `        <input type="radio" name="${radioName}" value="no">\n`;
  html += `        <span>${escapeHtmlText(request.__('no'))}</span>\n`;
  html += `      </label>\n`;
  html += `    </div>\n`;
  html += `  </div>\n`;
  html += `  <div class="text-box">\n`;
  html += `    <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.doNotAgree.otherThings.whatOtherThingsMatter'))}</p>\n`;
  html += `    <textarea class="user-input-area" id="${textareaId}" aria-label="${escapeHtmlText(request.__('sharePlan.yourProposedPlan.doNotAgree.otherThings.whatOtherThingsMatter'))}"></textarea>\n`;
  html += `  </div>\n`;
  html += '</div>\n';
  html += renderTextBox(
    request.__('sharePlan.yourProposedPlan.endOfSection'),
    request.__('sharePlan.yourProposedPlan.compromise.otherThings'),
  );
  html += '</section>\n\n';

  return html;
};

export default addOtherThings;
