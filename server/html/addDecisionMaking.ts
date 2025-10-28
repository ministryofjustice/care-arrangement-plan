import { Request } from 'express';

import {
  planLastMinuteChanges,
  planLongTermNotice,
  planReview,
} from '../utils/formattedAnswersForPdf';

import addAnswer, { renderTextBox } from './addAnswer';

const addPlanLastMinuteChanges = (request: Request): string => {
  return addAnswer(
    request.__('taskList.decisionMaking'),
    request.__('decisionMaking.planLastMinuteChanges.title'),
    request.__('decisionMaking.planLastMinuteChanges.howChangesCommunicatedAdditionalDescription'),
    planLastMinuteChanges(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
    request,
  );
};

const addPlanLongTermNotice = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('decisionMaking.planLongTermNotice.title'),
    request.__('decisionMaking.planLongTermNotice.sometimesYouNeedToPlanAhead'),
    planLongTermNotice(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
    request,
  );
};

const addPlanReview = (request: Request): string => {
  return addAnswer(
    undefined,
    request.__('decisionMaking.planReview.title'),
    request.__('decisionMaking.planReview.childrensNeedsChange'),
    planReview(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
    request,
  );
};

const addDecisionMaking = (request: Request): string => {
  const answers = [
    addPlanLastMinuteChanges(request),
    addPlanLongTermNotice(request),
    addPlanReview(request),
  ].filter((item) => item !== '');

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="decision-making" aria-labelledby="decision-making-heading">\n';
  html += answers.join('\n');
  html += renderTextBox(
    request.__('sharePlan.yourProposedPlan.endOfSection'),
    request.__('sharePlan.yourProposedPlan.compromise.decisionMaking'),
  );
  html += '</section>\n\n';

  return html;
};

export default addDecisionMaking;
