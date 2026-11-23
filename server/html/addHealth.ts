import { Request } from 'express';

import { childHealthNeeds, childHealthRoutineDecisions } from '../utils/formattedAnswersForPdf';

import addAnswer, { renderTextBox } from './addAnswer';

const addRoutineDecisions = (request: Request): string => {
  return addAnswer(
    request.__('sharePlan.childHealth.sectionTitle'),
    request.__('sharePlan.childHealth.title'),
    request.__('sharePlan.childHealth.routineDecisions.question'),
    request.__('childHealth.routineDecisions.description'),
    childHealthRoutineDecisions(request),
    request.__('sharePlan.childHealth.routineDecisions.doNotAgree'),
    request
  );
};

const addHealthNeeds = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.childHealth.healthNeeds.question'),
    request.__('childHealth.healthNeeds.description'),
    childHealthNeeds(request),
    request.__('sharePlan.childHealth.healthNeeds.doNotAgree'),
    request
  );
};

const addHealth = (request: Request): string => {
  const answers = [
    addRoutineDecisions(request),
    addHealthNeeds(request)
  ].filter((item) => item !== '');

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="child-health" aria-labelledby="child-health-heading">\n';
  html += answers.join('\n');
  html += '</section>\n\n';

  return html;
};

export default addHealth;
