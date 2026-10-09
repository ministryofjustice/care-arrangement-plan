import { Request } from 'express';

import {
  planLastMinuteChanges,
  planLongTermNotice,
  planReview
} from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addPlanLastMinuteChanges = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('taskList.decisionMaking'),
    request.__('decisionMaking.planLastMinuteChanges.title'),
    request.__('decisionMaking.planLastMinuteChanges.howChangesCommunicatedAdditionalDescription'),
    planLastMinuteChanges(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
  );
};

const addPlanLongTermNotice = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('decisionMaking.planLongTermNotice.title'),
    request.__('decisionMaking.planLongTermNotice.sometimesYouNeedToPlanAhead'),
    planLongTermNotice(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
  );
};

const addPlanReview = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('decisionMaking.planReview.title'),
    request.__('decisionMaking.planReview.childrensNeedsChange'),
    planReview(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
  );
};

const addDecisionMaking = (pdf: Pdf) => {
  const request = pdf.request;

  addPlanLastMinuteChanges(pdf, request);
  addPlanLongTermNotice(pdf, request);
  addPlanReview(pdf, request);
};

export default addDecisionMaking;
