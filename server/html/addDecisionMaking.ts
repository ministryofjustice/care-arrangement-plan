import { Request } from 'express';

import { planLastMinuteChanges, planLongTermNotice, planReview } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';

const addPlanLastMinuteChanges = (request: Request): string => {
  return addAnswer(
    request.__('sharePlan.decisionMaking.sectionTitle'),
    request.__('sharePlan.decisionMaking.title'),
    request.__('sharePlan.decisionMaking.planLastMinuteChanges.title'),
    request.__('sharePlan.decisionMaking.planLastMinuteChanges.intro'),
    planLastMinuteChanges(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
    request,
  );
};

const addPlanLongTermNotice = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.decisionMaking.planLongTermNotice.title'),
    request.__('sharePlan.decisionMaking.planLongTermNotice.intro'),
    planLongTermNotice(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
    request,
  );
};

const addPlanReview = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.decisionMaking.planReview.title'),
    request.__('sharePlan.decisionMaking.planReview.intro'),
    planReview(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
    request,
  );
};

const addDecisionMaking = (request: Request): string => {
  const answers = [addPlanLastMinuteChanges(request), addPlanLongTermNotice(request), addPlanReview(request)].filter(
    (item) => item !== '',
  );

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="decision-making" aria-labelledby="decision-making-heading">\n';
  html += answers.join('\n');
  html += '</section>\n\n';

  return html;
};

export default addDecisionMaking;
