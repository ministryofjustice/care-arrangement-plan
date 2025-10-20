import { Request } from 'express';

import {
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
} from '../utils/formattedAnswersForPdf';

import addAnswer, { renderTextBox } from './addAnswer';

const addGetBetweenHouseholds = (request: Request): string => {
  return addAnswer(
    request.__('taskList.handoverAndHolidays'),
    request.__('handoverAndHolidays.getBetweenHouseholds.title'),
    undefined,
    getBetweenHouseholds(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
    request,
  );
};

const addWhereHandover = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('handoverAndHolidays.whereHandover.title'),
    request.__('handoverAndHolidays.whereHandover.explainer'),
    whereHandover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
    request,
  );
};

const addWillChangeDuringSchoolHolidays = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
    undefined,
    willChangeDuringSchoolHolidays(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.willChangeDuringSchoolHolidays'),
    request,
  );
};

const addHowChangeDuringSchoolHolidays = (request: Request): string => {
  const answer = howChangeDuringSchoolHolidays(request);

  if (!answer) {
    return '';
  }

  return addAnswer(
    undefined,
    request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
    request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.content'),
    answer,
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.howChangeDuringSchoolHolidays'),
    request,
  );
};

const addItemsForChangeover = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
    request,
  );
};

const addHandoverAndHolidays = (request: Request): string => {
  const answers = [
    addGetBetweenHouseholds(request),
    addWhereHandover(request),
    addWillChangeDuringSchoolHolidays(request),
    addHowChangeDuringSchoolHolidays(request),
    addItemsForChangeover(request),
  ].filter((item) => item !== '');

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="handover-holidays" aria-labelledby="handover-holidays-heading">\n';
  html += answers.join('\n');
  html += renderTextBox(
    request.__('sharePlan.yourProposedPlan.endOfSection'),
    request.__('sharePlan.yourProposedPlan.compromise.handoverAndHolidays'),
  );
  html += '</section>\n\n';

  return html;
};

export default addHandoverAndHolidays;
