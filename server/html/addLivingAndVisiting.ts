import { Request } from 'express';

import {
  mostlyLive,
  whichSchedule,
  willOvernightsHappen,
  whichDaysOvernight,
  willDaytimeVisitsHappen,
  whichDaysDaytimeVisits,
} from '../utils/formattedAnswersForPdf';
import { parentNotMostlyLivedWith } from '../utils/sessionHelpers';

import addAnswer, { renderTextBox } from './addAnswer';

const addMostlyLive = (request: Request): string => {
  return addAnswer(
    request.__('taskList.livingAndVisiting'),
    request.__('livingAndVisiting.mostlyLive.title'),
    undefined,
    mostlyLive(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.mostlyLive'),
    request,
  );
};

const addWhichSchedule = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('livingAndVisiting.whichSchedule.title'),
    request.__('livingAndVisiting.whichSchedule.exactSplitWarning'),
    whichSchedule(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichSchedule'),
    request,
  );
};

const addWillOvernightsHappen = (request: Request): string => {
  const adult = parentNotMostlyLivedWith(request.session);

  return addAnswer(
    undefined,
    request.__('livingAndVisiting.willOvernightsHappen.title', { adult }),
    undefined,
    willOvernightsHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willOvernightsHappen', { adult }),
    request,
  );
};

const addWhichDaysOvernight = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('livingAndVisiting.whichDaysOvernight.title'),
    undefined,
    whichDaysOvernight(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysOvernight', {
      adult: parentNotMostlyLivedWith(request.session),
    }),
    request,
  );
};

const addWillDaytimeVisitsHappen = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('livingAndVisiting.willDaytimeVisitsHappen.title', { adult: parentNotMostlyLivedWith(request.session) }),
    undefined,
    willDaytimeVisitsHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willDaytimeVisitsHappen'),
    request,
  );
};

const addWhichDaysDaytimeVisits = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
    undefined,
    whichDaysDaytimeVisits(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysDaytimeVisits'),
    request,
  );
};

const addLivingAndVisiting = (request: Request): string => {
  const answers = [
    addMostlyLive(request),
    addWhichSchedule(request),
    addWillOvernightsHappen(request),
    addWhichDaysOvernight(request),
    addWillDaytimeVisitsHappen(request),
    addWhichDaysDaytimeVisits(request),
  ].filter((item) => item !== '');

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="living-visiting" aria-labelledby="living-visiting-heading">\n';
  html += answers.join('\n');
  html += renderTextBox(
    request.__('sharePlan.yourProposedPlan.endOfSection'),
    request.__('sharePlan.yourProposedPlan.compromise.livingAndVisiting'),
  );
  html += '</section>\n\n';

  return html;
};

export default addLivingAndVisiting;
