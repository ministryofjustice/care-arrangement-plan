import { Request } from 'express';

export const escapeHtmlText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

  return `<div class="text-box">\n  <h4>${escapeHtmlText(heading)}</h4>\n  <p>${escapeHtmlText(text)}</p>\n  <textarea class="user-input-area" id="${textareaId}" aria-label="${escapeHtmlText(text)}"></textarea>\n</div>\n`;
};

const addAnswer = (
  sectionHeading: string | undefined,
  question: string,
  subtext: string | undefined,
  answer: string | undefined,
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
  html += `    <p>${escapeHtmlText(disagreeText)}</p>\n`;
  html += `    <textarea class="user-input-area" id="${textareaId}" aria-label="${escapeHtmlText(disagreeText)}"></textarea>\n`;
  html += `  </div>\n`;

  html += '</div>\n';

  return html;
};

export default addAnswer;
