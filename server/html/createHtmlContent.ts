import { Request } from 'express';

import {
  mostlyLive,
  whichSchedule,
  willOvernightsHappen,
  whichDaysOvernight,
  willDaytimeVisitsHappen,
  whichDaysDaytimeVisits,
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
  whatWillHappen,
  whatOtherThingsMatter,
  planLastMinuteChanges,
  planLongTermNotice,
  planReview,
} from '../utils/formattedAnswersForPdf';
import { parentNotMostlyLivedWith } from '../utils/sessionHelpers';

const escapeHtmlText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

let questionCounter = 0;

const renderAnswer = (
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

const renderTextBox = (heading: string, text: string): string => {
  return `<div class="text-box">\n  <h4>${escapeHtmlText(heading)}</h4>\n  <p>${escapeHtmlText(text)}</p>\n</div>\n`;
};

const createHtmlContent = (request: Request): string => {
  // Reset question counter for each export
  questionCounter = 0;
  let html = '';

  // Living and Visiting Section
  const livingAndVisitingAnswers = [
    renderAnswer(
      request.__('taskList.livingAndVisiting'),
      request.__('livingAndVisiting.mostlyLive.title'),
      undefined,
      mostlyLive(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.mostlyLive'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('livingAndVisiting.whichSchedule.title'),
      request.__('livingAndVisiting.whichSchedule.exactSplitWarning'),
      whichSchedule(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichSchedule'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('livingAndVisiting.willOvernightsHappen.title', {
        adult: parentNotMostlyLivedWith(request.session),
      }),
      undefined,
      willOvernightsHappen(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willOvernightsHappen', {
        adult: parentNotMostlyLivedWith(request.session),
      }),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('livingAndVisiting.whichDaysOvernight.title'),
      undefined,
      whichDaysOvernight(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysOvernight', {
        adult: parentNotMostlyLivedWith(request.session),
      }),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('livingAndVisiting.willDaytimeVisitsHappen.title', {
        adult: parentNotMostlyLivedWith(request.session),
      }),
      undefined,
      willDaytimeVisitsHappen(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willDaytimeVisitsHappen'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
      undefined,
      whichDaysDaytimeVisits(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysDaytimeVisits'),
      request,
    ),
  ].filter((item) => item !== '');

  if (livingAndVisitingAnswers.length > 0) {
    html += '<section id="living-visiting" aria-labelledby="living-visiting-heading">\n';
    html += livingAndVisitingAnswers.join('\n');
    html += renderTextBox(
      request.__('sharePlan.yourProposedPlan.endOfSection'),
      request.__('sharePlan.yourProposedPlan.compromise.livingAndVisiting'),
    );
    html += '</section>\n\n';
  }

  // Handover and Holidays Section
  const handoverAnswer = howChangeDuringSchoolHolidays(request);
  const handoverAndHolidaysAnswers = [
    renderAnswer(
      request.__('taskList.handoverAndHolidays'),
      request.__('handoverAndHolidays.getBetweenHouseholds.title'),
      undefined,
      getBetweenHouseholds(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('handoverAndHolidays.whereHandover.title'),
      request.__('handoverAndHolidays.whereHandover.explainer'),
      whereHandover(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
      undefined,
      willChangeDuringSchoolHolidays(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.willChangeDuringSchoolHolidays'),
      request,
    ),
    handoverAnswer
      ? renderAnswer(
          undefined,
          request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
          request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.content'),
          handoverAnswer,
          request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.howChangeDuringSchoolHolidays'),
          request,
        )
      : '',
    renderAnswer(
      undefined,
      request.__('handoverAndHolidays.itemsForChangeover.title'),
      undefined,
      itemsForChangeover(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
      request,
    ),
  ].filter((item) => item !== '');

  if (handoverAndHolidaysAnswers.length > 0) {
    html += '<section id="handover-holidays" aria-labelledby="handover-holidays-heading">\n';
    html += handoverAndHolidaysAnswers.join('\n');
    html += renderTextBox(
      request.__('sharePlan.yourProposedPlan.endOfSection'),
      request.__('sharePlan.yourProposedPlan.compromise.handoverAndHolidays'),
    );
    html += '</section>\n\n';
  }

  // Special Days Section
  const specialDaysAnswer = whatWillHappen(request);
  if (specialDaysAnswer) {
    html += '<section id="special-days" aria-labelledby="special-days-heading">\n';
    html += renderAnswer(
      request.__('taskList.specialDays'),
      request.__('specialDays.whatWillHappen.title'),
      request.__('specialDays.whatWillHappen.content'),
      specialDaysAnswer,
      request.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
      request,
    );
    html += renderTextBox(
      request.__('sharePlan.yourProposedPlan.endOfSection'),
      request.__('sharePlan.yourProposedPlan.compromise.specialDays'),
    );
    html += '</section>\n\n';
  }

  // Other Things Section
  const otherThingsAnswer = whatOtherThingsMatter(request);
  if (otherThingsAnswer) {
    questionCounter++;
    const radioName = `question-${questionCounter}`;
    const textareaId = `notes-${questionCounter}`;

    html += '<section id="other-things" aria-labelledby="other-things-heading">\n';
    html += `<div class="answer-section">\n`;
    html += `  <h2>${escapeHtmlText(request.__('taskList.otherThings'))}</h2>\n`;
    html += `  <h3>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.title'))}</h3>\n`;
    html += `  <p>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.thingsToAgree'))}</p>\n`;
    html += `  <ul>\n`;
    html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.religionDietAndRules'))}</li>\n`;
    html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.extraCurriculars'))}</li>\n`;
    html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.friendsAndFamily'))}</li>\n`;
    html += `    <li>${escapeHtmlText(request.__('otherThings.whatOtherThingsMatter.otherContact'))}</li>\n`;
    html += `  </ul>\n`;
    html += `  <p class="answer">${escapeHtmlText(otherThingsAnswer)}</p>\n`;
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
    html += `</div>\n`;
    html += renderTextBox(
      request.__('sharePlan.yourProposedPlan.endOfSection'),
      request.__('sharePlan.yourProposedPlan.compromise.otherThings'),
    );
    html += '</section>\n\n';
  }

  // Decision Making Section
  const decisionMakingAnswers = [
    renderAnswer(
      request.__('taskList.decisionMaking'),
      request.__('decisionMaking.planLastMinuteChanges.title'),
      request.__('decisionMaking.planLastMinuteChanges.howChangesCommunicatedAdditionalDescription'),
      planLastMinuteChanges(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('decisionMaking.planLongTermNotice.title'),
      request.__('decisionMaking.planLongTermNotice.sometimesYouNeedToPlanAhead'),
      planLongTermNotice(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
      request,
    ),
    renderAnswer(
      undefined,
      request.__('decisionMaking.planReview.title'),
      request.__('decisionMaking.planReview.childrensNeedsChange'),
      planReview(request),
      request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
      request,
    ),
  ].filter((item) => item !== '');

  if (decisionMakingAnswers.length > 0) {
    html += '<section id="decision-making" aria-labelledby="decision-making-heading">\n';
    html += decisionMakingAnswers.join('\n');
    html += renderTextBox(
      request.__('sharePlan.yourProposedPlan.endOfSection'),
      request.__('sharePlan.yourProposedPlan.compromise.decisionMaking'),
    );
    html += '</section>\n\n';
  }

  // What Happens Now Section
  html += '<section id="what-happens-now" aria-labelledby="what-happens-now-heading">\n';
  html += `  <h2 id="what-happens-now-heading">${escapeHtmlText(request.__('sharePlan.yourProposedPlan.whatHappensNowHeading'))}</h2>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.nowSendPlan', { senderName: request.session.initialAdultName }))}</p>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.notLegallyBinding'))}</p>\n`;
  html += `  <p>${escapeHtmlText(request.__('sharePlan.yourProposedPlan.unableToAgree'))}</p>\n`;
  // Note: The last paragraph has URLs, so we don't escape it - it's handled by the customUrlize filter in the template
  html += '</section>\n';

  return html;
};

export default createHtmlContent;
