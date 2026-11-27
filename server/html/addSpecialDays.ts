import { Request } from 'express';

import { whatWillHappen } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';

const addSpecialDays = (request: Request): string => {
  const answer = whatWillHappen(request);

  if (!answer) {
    return '';
  }

  let html = '<section id="special-days" aria-labelledby="special-days-heading">\n';
  html += addAnswer(
    request.__('sharePlan.specialDays.sectionTitle'),
    request.__('sharePlan.specialDays.title'),
    request.__('sharePlan.specialDays.whatWillHappen.title'),
    request.__('sharePlan.specialDays.whatWillHappen.content'),
    answer,
    request.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
    request,
  );
  html += '</section>\n\n';

  return html;
};

export default addSpecialDays;
