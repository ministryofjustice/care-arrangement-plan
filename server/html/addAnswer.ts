import { Request } from 'express';

import { PerChildFormattedAnswerForPdf } from '../utils/formattedAnswersForPdf';

export const escapeHtmlText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Type guard to check if answer is a per-child answer structure
export const isPerChildAnswer = (answer: string | PerChildFormattedAnswerForPdf): answer is PerChildFormattedAnswerForPdf => {
  return typeof answer === 'object' && 'defaultAnswer' in answer;
};

// Render per-child answer as HTML
export const renderPerChildAnswerHtml = (answer: PerChildFormattedAnswerForPdf): string => {
  let html = '';
  html += `  <p class="govuk-body govuk-!-margin-bottom-1"><strong>For all children:</strong></p>\n`;
  html += `  <p class="answer">${escapeHtmlText(answer.defaultAnswer)}</p>\n`;

  if (answer.perChildAnswers) {
    for (const childAnswer of answer.perChildAnswers) {
      html += `  <p class="govuk-body govuk-!-margin-bottom-1"><strong>For ${escapeHtmlText(childAnswer.childName)}:</strong></p>\n`;
      html += `  <p class="answer">${escapeHtmlText(childAnswer.answer)}</p>\n`;
    }
  }

  return html;
};

let questionCounter = 0;

export const resetQuestionCounter = (): void => {
  questionCounter = 0;
};

export const getNextQuestionNumber = (): number => {
  questionCounter++;
  return questionCounter;
};

let textboxCounter = 0;

export const resetTextboxCounter = (): void => {
  textboxCounter = 0;
};

export const renderTextBox = (heading: string, text: string): string => {
  textboxCounter++;
  const textareaId = `textbox-${textboxCounter}`;

  return `<div class="text-box">\n  <h4>${escapeHtmlText(heading)}</h4>\n  <div class="govuk-form-group">\n    <label class="govuk-label" for="${textareaId}">\n      ${escapeHtmlText(text)}\n    </label>\n    <textarea class="govuk-textarea user-input-area" id="${textareaId}" name="${textareaId}" rows="5"></textarea>\n  </div>\n</div>\n`;
};

const addAnswer = (
  sectionHeading: string | undefined,
  question: string,
  subtext: string | undefined,
  answer: string | PerChildFormattedAnswerForPdf | undefined,
  disagreeText: string,
  request: Request,
): string => {
  if (!answer) return '';

  questionCounter++;
  const radioName = `question-${questionCounter}`;
  const textareaId = `notes-${questionCounter}`;

  let html = '<div class="answer-section">\n';

  if (sectionHeading) {
    html += `  <h2>${escapeHtmlText(sectionHeading)}</h2>\n`;
  }

  html += `  <h3 class="question">${escapeHtmlText(question)}</h3>\n`;

  if (subtext) {
    html += `  <p class="hint">${escapeHtmlText(subtext)}</p>\n`;
  }

  // Handle per-child answer structure
  if (isPerChildAnswer(answer)) {
    html += renderPerChildAnswerHtml(answer);
  } else {
    html += `  <p class="answer">${escapeHtmlText(answer)}</p>\n`;
  }

  html += `  <div class="do-you-agree">\n`;
  html += `    <div class="govuk-form-group">\n`;
  html += `      <fieldset class="govuk-fieldset">\n`;
  html += `        <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">\n`;
  html += `          ${escapeHtmlText(request.__('sharePlan.yourProposedPlan.doYouAgree'))}\n`;
  html += `        </legend>\n`;
  html += `        <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">\n`;
  html += `          <div class="govuk-checkboxes__item">\n`;
  html += `            <input class="govuk-checkboxes__input" id="${radioName}-yes" name="${radioName}" type="checkbox" value="yes">\n`;
  html += `            <label class="govuk-label govuk-checkboxes__label" for="${radioName}-yes">\n`;
  html += `              ${escapeHtmlText(request.__('yes'))}\n`;
  html += `            </label>\n`;
  html += `          </div>\n`;
  html += `          <div class="govuk-checkboxes__item">\n`;
  html += `            <input class="govuk-checkboxes__input" id="${radioName}-no" name="${radioName}" type="checkbox" value="no">\n`;
  html += `            <label class="govuk-label govuk-checkboxes__label" for="${radioName}-no">\n`;
  html += `              ${escapeHtmlText(request.__('no'))}\n`;
  html += `            </label>\n`;
  html += `          </div>\n`;
  html += `        </div>\n`;
  html += `      </fieldset>\n`;
  html += `    </div>\n`;
  html += `  </div>\n`;

  html += `  <div class="text-box">\n`;
  html += `    <div class="govuk-form-group">\n`;
  html += `      <label class="govuk-label" for="${textareaId}">\n`;
  html += `        ${escapeHtmlText(disagreeText)}\n`;
  html += `      </label>\n`;
  html += `      <textarea class="govuk-textarea user-input-area" id="${textareaId}" name="${textareaId}" rows="5"></textarea>\n`;
  html += `    </div>\n`;
  html += `  </div>\n`;

  html += '</div>\n';

  return html;
};

export default addAnswer;
