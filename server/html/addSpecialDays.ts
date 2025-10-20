import { Request } from 'express';

import { whatWillHappen } from '../utils/formattedAnswersForPdf';

import addAnswer, { renderTextBox } from './addAnswer';

const addSpecialDays = (request: Request): string => {
  const answer = whatWillHappen(request);

  if (!answer) {
    return '';
  }

  let html = '<section id="special-days" aria-labelledby="special-days-heading">\n';
  html += addAnswer(
    request.__('taskList.specialDays'),
    request.__('specialDays.whatWillHappen.title'),
    request.__('specialDays.whatWillHappen.content'),
    answer,
    request.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
    request,
  );
  html += renderTextBox(
    request.__('sharePlan.yourProposedPlan.endOfSection'),
    request.__('sharePlan.yourProposedPlan.compromise.specialDays'),
  );
  html += '</section>\n\n';

  return html;
};

export default addSpecialDays;
